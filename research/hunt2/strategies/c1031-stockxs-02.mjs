// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-02), frozen before code.
export const meta = {
  id: "c1031-stockxs-02",
  name: "Calmar ranking: the 8 large caps with the best one-year return per unit of maximum drawdown, monthly",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: {"window": 252, "top": 8, "ddFloor": 0.02},
};

const ok = (b, a, z) => {
  for (let k = a; k <= z; k++) {
    const c = b[k].close;
    if (!(Number.isFinite(c) && c > 0)) return false;
  }
  return true;
};
const byName = (x, y) => (x.s < y.s ? -1 : x.s > y.s ? 1 : 0);
const equal = (list, n) => {
  const w = {};
  for (const x of list.slice(0, n)) w[x.s] = 1 / n;
  return w;
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const cand = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    const e = b.length - 1;
    const a = e - (p.window - 1);
    if (b.length < 253 || !ok(b, a, e)) continue;
    const R = b[e].close / b[a].close - 1;
    if (!(R > 0)) continue;
    let peak = b[a].close, mdd = 0;
    for (let k = a; k <= e; k++) {
      peak = Math.max(peak, b[k].close);
      mdd = Math.max(mdd, (peak - b[k].close) / peak);
    }
    cand.push({ s, v: R / Math.max(mdd, p.ddFloor) });
  }
  if (cand.length < p.top) return {};
  cand.sort((x, y) => y.v - x.v || byName(x, y));
  return equal(cand, p.top);
}
