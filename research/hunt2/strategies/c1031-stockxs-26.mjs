// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-26). Equal-weight z-score composite of 12-1 momentum, low vol and 1-month reversal, top 10, monthly.
export const meta = {
  id: "c1031-stockxs-26",
  name: "Three-factor price composite: the 10 large caps with the best equal-weight z-score of 12-1 momentum, low volatility and 1-month reversal, monthly",
  family: "equity-factors",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { top: 10 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < 252 || !pos(b, e - 252, e)) continue;
    const r = [];
    for (let k = e - 62; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    const mu = r.reduce((s, x) => s + x, 0) / r.length;
    const sd = Math.sqrt(r.reduce((s, x) => s + (x - mu) ** 2, 0) / (r.length - 1));
    names.push({
      sym,
      A: b[e - 21].close / b[e - 252].close - 1,
      B: -sd,
      C: -(b[e].close / b[e - 21].close - 1),
    });
  }
  if (names.length < 15) return {};
  const z = (key) => {
    const v = names.map((n) => n[key]);
    const m = v.reduce((s, x) => s + x, 0) / v.length;
    const sd = Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / v.length);
    return sd === 0 ? v.map(() => 0) : v.map((x) => (x - m) / sd);
  };
  const zA = z("A"), zB = z("B"), zC = z("C");
  const sc = names.map((n, i) => ({ sym: n.sym, s: zA[i] + zB[i] + zC[i] }));
  sc.sort((x, y) => y.s - x.s || byName(x, y));
  const top = ctx.params.top;
  const w = {};
  for (const p of sc.slice(0, top)) w[p.sym] = 1 / top;
  return w;
}
