// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-28). Long-horizon sum of log open-to-close, long the 8 lowest, monthly.
export const meta = {
  id: "c1031-stockxs-28",
  name: "Long-horizon intraday reversal: the 8 large caps with the lowest cumulative open-to-close return over 12-1 months, monthly",
  family: "mean_reversion",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { start: 251, end: 21, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const { start, end, top } = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < start + 1 || !pos(b, e - start, e - end)) continue;
    let s = 0;
    for (let k = e - start; k <= e - end; k++) s += Math.log(b[k].close / b[k].open);
    names.push({ sym, s });
  }
  if (names.length < top) return {};
  names.sort((x, y) => x.s - y.s || byName(x, y));
  const w = {};
  for (const p of names.slice(0, top)) w[p.sym] = 1 / top;
  return w;
}
