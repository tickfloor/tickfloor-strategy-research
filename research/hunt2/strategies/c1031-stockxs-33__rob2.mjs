// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-33). 12-1 log return after dropping the 8 highest-volume days, top 8, monthly.
export const meta = {
  id: "c1031-stockxs-33__rob2",
  name: "Momentum without event days: 12-1 return after removing each stock's 8 highest-volume days, top 8, monthly (+25%)",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { start: 314, end: 21, removeDays: 8, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const P = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < P.start + 1 || !pos(b, e - P.start - 1, e - P.end)) continue;
    const days = [];
    for (let k = e - P.start; k <= e - P.end; k++) days.push(k);
    // highest volume first; ties: later bar first
    days.sort((x, y) => b[y].volume - b[x].volume || y - x);
    const drop = new Set(days.slice(0, P.removeDays));
    let s = 0;
    for (const k of days) if (!drop.has(k)) s += Math.log(b[k].close / b[k - 1].close);
    names.push({ sym, s });
  }
  if (names.length < P.top) return {};
  names.sort((x, y) => y.s - x.s || byName(x, y));
  const w = {};
  for (const p of names.slice(0, P.top)) w[p.sym] = 1 / P.top;
  return w;
}
