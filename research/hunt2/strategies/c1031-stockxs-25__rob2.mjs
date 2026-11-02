// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-25). Count of 5-day blocks beating the EW basket, top 8, monthly.
export const meta = {
  id: "c1031-stockxs-25__rob2",
  name: "Relative win rate: the 8 large caps that beat the equal-weight basket in the most 5-day blocks of the past 26 weeks, monthly (+25%)",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { blocks: 33, blockLen: 5, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const { blocks: B, blockLen: K, top } = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < B * K || !pos(b, e - B * K, e)) continue;
    const r = [];
    for (let j = 0; j < B; j++) {
      const bj = e - K * (B - 1 - j);
      r.push(b[bj].close / b[bj - K].close - 1);
    }
    names.push({ sym, r, r130: b[e].close / b[e - B * K].close - 1 });
  }
  if (names.length < top) return {};
  const basket = [];
  for (let j = 0; j < B; j++) basket.push(names.reduce((s, n) => s + n.r[j], 0) / names.length);
  for (const n of names) n.score = n.r.reduce((s, x, j) => s + (x > basket[j] ? 1 : 0), 0);
  names.sort((x, y) => y.score - x.score || y.r130 - x.r130 || byName(x, y));
  const w = {};
  for (const n of names.slice(0, top)) w[n.sym] = 1 / top;
  return w;
}
