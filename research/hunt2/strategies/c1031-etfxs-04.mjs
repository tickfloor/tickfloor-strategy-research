// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-04). Blitz, Huij & Martens 2011 residual momentum, three factor ETFs.
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-04",
  name: "Three-factor residual momentum across 22 ETFs (factors QQQ, IEF, DBC), months 12-2 residual, monthly",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ",
    "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 252, skip: 21, top: 5 },
};

const FACT = ["QQQ", "IEF", "DBC"];

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

function sampleStd(a) {
  return Math.sqrt(sampleCov(a, a));
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
  const ok = (s) => universe[s] !== undefined && universe[s].length > p.window + 1;
  if (!FACT.every(ok)) return {};
  const F = FACT.map((s) => retsAt(universe[s], 0, p.window));
  const cands = Object.keys(universe).filter((s) => !FACT.includes(s) && ok(s)).sort();
  if (cands.length < 10) return {};
  const scored = [];
  for (const s of cands) {
    const y = retsAt(universe[s], 0, p.window);
    const X = y.map((_, k) => [1, F[0][k], F[1][k], F[2][k]]);
    const XtX = [0, 1, 2, 3].map((a) => [0, 1, 2, 3].map((c) => {
      let v = 0;
      for (let k = 0; k < y.length; k++) v += X[k][a] * X[k][c];
      return v;
    }));
    const Xty = [0, 1, 2, 3].map((a) => {
      let v = 0;
      for (let k = 0; k < y.length; k++) v += X[k][a] * y[k];
      return v;
    });
    const beta = solve(XtX, Xty);
    // residual keeps the intercept (u = r_s - b . f)
    const u = y.map((yk, k) => yk - (beta[1] * F[0][k] + beta[2] * F[1][k] + beta[3] * F[2][k]));
    const uw = u.slice(0, u.length - p.skip); // k = e-251 .. e-21
    const sd = sampleStd(uw);
    if (!(sd > 0)) continue;
    let sum = 0;
    for (const x of uw) sum += x;
    scored.push({ s, sc: sum / sd });
  }
  if (scored.length < p.top) return {};
  scored.sort((a, b) => b.sc - a.sc || (a.s < b.s ? -1 : 1));
  const out = {};
  for (const x of scored.slice(0, p.top)) out[x.s] = 1 / p.top;
  return out;
}
