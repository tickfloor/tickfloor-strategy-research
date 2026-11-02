// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-10), frozen before code.
export const meta = {
  id: "c1031-stockxs-10",
  name: "Pullback in an uptrend: among large caps above their 200-day mean, buy the 8 with the weakest last 5 days, weekly",
  family: "mean_reversion",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  params: {"smaWin": 200, "retWin": 5, "top": 8},
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
    if (b.length < 201 || !ok(b, e - (p.smaWin - 1), e)) continue;
    let sum = 0;
    for (let k = e - (p.smaWin - 1); k <= e; k++) sum += b[k].close;
    if (!(b[e].close > sum / p.smaWin)) continue;
    cand.push({ s, v: b[e].close / b[e - p.retWin].close - 1 });
  }
  if (cand.length < 3) return {};
  cand.sort((x, y) => x.v - y.v || byName(x, y));
  return equal(cand, p.top);
}
