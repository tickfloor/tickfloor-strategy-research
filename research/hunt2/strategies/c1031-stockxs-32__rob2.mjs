// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-32). IBD-style 0.4/0.2/0.2/0.2 weighted four-quarter return, top 8, monthly.
export const meta = {
  id: "c1031-stockxs-32__rob2",
  name: "IBD-style relative strength rating: the 8 large caps with the highest 0.4/0.2/0.2/0.2 weighted four-quarter return, monthly (+25%)",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { weights: [0.4, 0.2, 0.2, 0.2], quarter: 79, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const { weights, quarter: Q, top } = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < 4 * Q || !pos(b, e - 4 * Q, e)) continue;
    // Qk (k=0..3) = close[e-Q*k] / close[e-Q*(k+1)] - 1
    let s = 0;
    for (let k = 0; k < 4; k++) s += weights[k] * (b[e - Q * k].close / b[e - Q * (k + 1)].close - 1);
    names.push({ sym, s });
  }
  if (names.length < top) return {};
  names.sort((x, y) => y.s - x.s || byName(x, y));
  const w = {};
  for (const p of names.slice(0, top)) w[p.sym] = 1 / top;
  return w;
}
