// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-09), frozen before code.
export const meta = {
  id: "c1031-stockxs-09",
  name: "Time above the 50-day average: the 8 large caps that have spent the most of the past 126 days above their 50-day mean, monthly",
  family: "trend",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: {"window": 126, "ma": 50, "top": 8},
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
    const first = e - (p.window - 1) - (p.ma - 1);
    if (b.length < 176 || !ok(b, first, e)) continue;
    let cnt = 0;
    for (let k = e - (p.window - 1); k <= e; k++) {
      let sum = 0;
      for (let j = k - (p.ma - 1); j <= k; j++) sum += b[j].close;
      if (b[k].close > sum / p.ma) cnt++;
    }
    cand.push({ s, v: cnt, r: b[e].close / b[e - p.window].close - 1 });
  }
  if (cand.length < p.top) return {};
  cand.sort((x, y) => y.v - x.v || y.r - x.r || byName(x, y));
  return equal(cand, p.top);
}
