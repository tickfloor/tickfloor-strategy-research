// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-03). Varadi, Kapler, Bajaj & Zhang: Minimum Correlation Algorithm (heuristic, no inversion).
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-03",
  name: "Minimum Correlation Algorithm weights across 12 cross-asset ETFs, 252-day, monthly",
  family: "volatility",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLE", "XLV", "XLU", "VNQ", "TLT", "IEF", "HYG", "GLD", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 252 },
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

function sampleStd(a) {
  return Math.sqrt(sampleCov(a, a));
}

// Standard normal CDF, Abramowitz-Stegun 7.1.26 erf approximation.
function Phi(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-x * x);
  return 0.5 * (1 + (z < 0 ? -erf : erf));
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > p.window + 1).sort();
  const N = syms.length;
  if (N < 8) return {};
  const R = syms.map((s) => retsAt(universe[s], 0, p.window));
  const sd = R.map((x) => sampleStd(x));
  const rho = R.map((x, i) => R.map((y, j) => sampleCov(x, y) / (sd[i] * sd[j])));
  const pairs = [];
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) pairs.push(rho[i][j]);
  const mu = mean(pairs);
  const s = sampleStd(pairs);
  const A = rho.map((row, i) => row.map((r, j) => (i === j ? 0 : 1 - Phi((r - mu) / s))));
  const a = A.map((row, i) => mean(row.filter((_, j) => j !== i)));
  // rank ascending by a (smallest = 1), ties broken by symbol name
  const order = syms.map((_, i) => i).sort((x, y) => a[x] - a[y] || (syms[x] < syms[y] ? -1 : 1));
  const rk = new Array(N);
  order.forEach((i, k) => { rk[i] = k + 1; });
  const rs = rk.reduce((x, y) => x + y, 0);
  const pv = rk.map((r) => r / rs);
  const q = A.map((row) => row.reduce((acc, Aij, j) => acc + Aij * pv[j], 0));
  const raw = q.map((qi, i) => qi / sd[i]);
  const tot = raw.reduce((x, y) => x + y, 0);
  const out = {};
  syms.forEach((sym, i) => { out[sym] = raw[i] / tot; });
  return out;
}
