// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-18). Count of 6 month-end checkpoints in the top quartile on 12-1 momentum, monthly.
export const meta = {
  id: "c1031-stockxs-18__rob1",
  name: "Leader persistence: the 8 large caps that have been in the top quarter on 12-1 momentum at the most of the last 6 month-ends, monthly (-25%)",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { checkpoints: 6, step: 21, top: 8, topQuartile: 10 },
};

const ok = (x) => Number.isFinite(x) && x > 0;
const LOOKBACK = 189;
const SKIP = 21;

export function rank(universe, t, ctx) {
  const { checkpoints, step, top, topQuartile } = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe).sort()) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < 295) continue;
    let good = true;
    for (let k = e - 294; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    if (!good) continue;
    const m = [];
    for (let j = 0; j < checkpoints; j++) {
      const tj = e - step * j;
      m.push(b[tj - SKIP].close / b[tj - LOOKBACK].close - 1);
    }
    names.push({ sym, m, score: 0 });
  }
  for (let j = 0; j < checkpoints; j++) {
    const order = [...names].sort((x, y) => y.m[j] - x.m[j] || (x.sym < y.sym ? -1 : 1));
    for (const n of order.slice(0, topQuartile)) n.score++;
  }
  if (names.length < top) return {};
  names.sort((x, y) => y.score - x.score || y.m[0] - x.m[0] || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const n of names.slice(0, top)) w[n.sym] = 1 / top;
  return w;
}
