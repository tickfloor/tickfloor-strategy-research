// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-05), frozen before code.
export const meta = {
  id: "c1031-stockxs-05",
  name: "Cross-sectional IBS reversal: the 8 large caps that closed nearest their lows on average over the past 5 sessions, weekly",
  family: "mean_reversion",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  params: {"window": 5, "top": 8},
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
    if (b.length < 6 || !ok(b, a, e)) continue;
    let sum = 0, good = true;
    for (let k = a; k <= e; k++) {
      const h = b[k].high, l = b[k].low;
      if (!(l > 0 && h > l)) { good = false; break; }
      sum += (b[k].close - l) / (h - l);
    }
    if (!good) continue;
    cand.push({ s, v: sum / p.window });
  }
  if (cand.length < p.top) return {};
  cand.sort((x, y) => x.v - y.v || byName(x, y));
  return equal(cand, p.top);
}
