// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-02). Ledoit & Wolf 2003 constant-correlation shrinkage, long-only min variance.
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-02",
  name: "Long-only minimum-variance sectors with constant-correlation shrinkage, 252-day, monthly",
  family: "volatility",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 252, shrink: 0.5 },
};

function retsAt(b, off, n) {
  const e = b.length - 1 - off;
  const out = [];
  for (let k = e - n + 1; k <= e; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

function mean(a) {
  let s = 0;
  for (const x of a) s += x;
  return s / a.length;
}

function sampleCov(x, y) {
  const mx = mean(x);
  const my = mean(y);
  let s = 0;
  for (let k = 0; k < x.length; k++) s += (x[k] - mx) * (y[k] - my);
  return s / (x.length - 1);
}

// Gaussian elimination with partial pivoting for A x = b.
function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > p.window + 1).sort();
  const N = syms.length;
  if (N < 6) return {};
  const R = syms.map((s) => retsAt(universe[s], 0, p.window));
  const S = R.map((x) => R.map((y) => sampleCov(x, y)));
  let sumC = 0;
  let nc = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      sumC += S[i][j] / Math.sqrt(S[i][i] * S[j][j]);
      nc++;
    }
  }
  const rbar = sumC / nc;
  const Sig = S.map((row, i) => row.map((Sij, j) => {
    const F = i === j ? Sij : rbar * Math.sqrt(S[i][i] * S[j][j]);
    return p.shrink * F + (1 - p.shrink) * Sij;
  }));
  let A = syms.map((_, i) => i);
  for (;;) {
    if (!A.length) return {};
    const M = A.map((i) => A.map((j) => Sig[i][j]));
    const x = solve(M, A.map(() => 1));
    const tot = x.reduce((a, b) => a + b, 0);
    const wA = x.map((v) => v / tot);
    let worst = -1;
    for (let k = 0; k < wA.length; k++) if (wA[k] < 0 && (worst < 0 || wA[k] < wA[worst])) worst = k;
    if (worst < 0) {
      const out = {};
      A.forEach((i, k) => { out[syms[i]] = wA[k]; });
      return out;
    }
    A.splice(worst, 1);
  }
}
