// Spec: research/hunt2/campaign-1024/prereg-r3.json (c1024-r3-15). Portfolio rank, monthly, long-only.
export const meta = {
  id: "c1024-r3-15",
  name: "12-1 momentum top 20% with the sleeve volatility matched to the EW universe, residual in cash, exposure check (e) as a hard gate (wide US stocks), monthly",
  family: "momentum",
  source: "c1024/r3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 252, skip: 21, need: 254, minNames: 50, fraction: 0.2, minHoldings: 10, volWindow: 63 },
};

const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
function sampleStd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((p, q) => p + (q - m) ** 2, 0) / (xs.length - 1));
}
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);

export function rank(universe, t, ctx) {
  const { form, skip, need, minNames, fraction, minHoldings, volWindow } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);
  const mom = elig.map((s) => {
    const b = universe[s], e = b.length - 1;
    return [s, b[e - skip].close / b[e - form].close - 1];
  });
  const N = Math.max(minHoldings, Math.round(fraction * M));
  const sleeve = topN(mom, N);

  const avg = (syms, j) => mean(syms.map((s) => retAt(universe[s], universe[s].length - 1 - j)));
  const pS = [], pM = [];
  for (let j = 0; j < volWindow; j++) { pS.push(avg(sleeve, j)); pM.push(avg(elig, j)); }
  const sigS = sampleStd(pS), sigM = sampleStd(pM);
  const w = sigS > 0 ? Math.min(1, sigM / sigS) : 1;

  const out = {};
  for (const s of sleeve) out[s] = w / N;
  return out;
}
