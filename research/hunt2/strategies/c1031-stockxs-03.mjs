// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-03), frozen before code.
export const meta = {
  id: "c1031-stockxs-03",
  name: "Correction-state resilience: equal-weight all 40 until the average name is 7% off its 63-day high, then hold only the 8 shallowest drawdowns",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: {"highWindow": 63, "trigger": -0.07, "top": 8},
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
    const a = e - (p.highWindow - 1);
    if (b.length < 64 || !ok(b, a, e)) continue;
    let hi = 0;
    for (let k = a; k <= e; k++) hi = Math.max(hi, b[k].close);
    cand.push({ s, v: b[e].close / hi - 1 });
  }
  const n = cand.length;
  if (n === 0) return {};
  const D = cand.reduce((acc, x) => acc + x.v, 0) / n;
  if (D > p.trigger) {
    if (n < 20) return {};
    const w = {};
    for (const x of cand) w[x.s] = 1 / n;
    return w;
  }
  if (n < p.top) return {};
  cand.sort((x, y) => y.v - x.v || byName(x, y));
  return equal(cand, p.top);
}
