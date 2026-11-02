// c1031 round-4 spec c1031-r4-19 (campaign-1031/prereg-r4.json, frozen before code).
// Top-quintile 5% VaR sleeve, sleeve volatility matched to the EW universe, residual in cash. Monthly, long-only.
// Pre-registered expectation: zero edge (construction test). Gate (applied at retest): counts as ahead only if exposure check (e) passes.
export const meta = {
  id: "c1031-r4-19__rob1",
  name: "Value-at-risk top quintile with the sleeve volatility matched to the EW universe, residual in cash, exposure check (e) as a hard gate (wide US stocks), monthly (-25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { varWindow: 188, q: 0.05, k: 10, need: 192, minNames: 50, fraction: 0.2, minHoldings: 10, volWindow: 63 },
};

const ret = (b, j) => b[j].close / b[j - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

function mean(xs) {
  let m = 0;
  for (const x of xs) m += x;
  return m / xs.length;
}

function sampleStd(xs) {
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return Math.sqrt(s / (xs.length - 1));
}

// 5% empirical VaR: minus the k-th lowest of the win daily returns ending at bar e
function varOf(b, e, win, k) {
  const r = [];
  for (let j = 0; j < win; j++) r.push(ret(b, e - j));
  r.sort((x, y) => x - y);
  return -r[k - 1];
}

const sortDesc = (names, val) => names.slice().sort((x, y) => val.get(y) - val.get(x) || cmp(x, y));

export function rank(universe, t, ctx) {
  const { varWindow, k, need, minNames, fraction, minHoldings, volWindow } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);
  const E = new Map(elig.map((s) => [s, universe[s].length - 1]));

  const va = new Map(elig.map((s) => [s, varOf(universe[s], E.get(s), varWindow, k)]));
  const N = Math.max(minHoldings, Math.round(fraction * M));
  const sleeve = sortDesc(elig, va).slice(0, N);

  // daily equal-weight return series over j = 0..volWindow-1
  const series = (syms) => {
    const xs = [];
    for (let j = 0; j < volWindow; j++) {
      let s = 0;
      for (const sym of syms) s += ret(universe[sym], E.get(sym) - j);
      xs.push(s / syms.length);
    }
    return xs;
  };
  const sigmaS = sampleStd(series(sleeve));
  const sigmaM = sampleStd(series(elig));
  const w = sigmaS > 0 ? Math.min(1, sigmaM / sigmaS) : 1;

  const out = {};
  for (const s of sleeve) out[s] = w / N;
  return out;
}
