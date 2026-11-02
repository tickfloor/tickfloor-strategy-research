// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-06), frozen before code.
export const meta = {
  id: "c1031-stockxs-06",
  name: "Chaikin money flow leaders: the 8 large caps with the highest 63-day close-location-weighted volume flow, monthly",
  family: "volume",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: {"window": 63, "top": 8},
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
    if (b.length < 64 || !ok(b, a, e)) continue;
    let num = 0, den = 0, good = true;
    for (let k = a; k <= e; k++) {
      const { high: h, low: l, close: c, volume: v } = b[k];
      if (!(l > 0 && h > l && v >= 0)) { good = false; break; }
      num += (((c - l) - (h - c)) / (h - l)) * v;
      den += v;
    }
    if (!good || den === 0) continue;
    cand.push({ s, v: num / den });
  }
  if (cand.length < p.top) return {};
  cand.sort((x, y) => y.v - x.v || byName(x, y));
  return equal(cand, p.top);
}
