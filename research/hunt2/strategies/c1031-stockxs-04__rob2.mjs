// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-04), frozen before code.
export const meta = {
  id: "c1031-stockxs-04__rob2",
  name: "Volatility compression: the 10 large caps whose 1-month volatility is lowest relative to their 1-year volatility, monthly (+25%)",
  family: "volatility",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: {"shortWin": 21, "longWin": 315, "top": 10},
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

const sdRet = (b, a, z) => {
  const r = [];
  for (let k = a; k <= z; k++) r.push(b[k].close / b[k - 1].close - 1);
  const m = r.reduce((s, x) => s + x, 0) / r.length;
  return Math.sqrt(r.reduce((s, x) => s + (x - m) ** 2, 0) / (r.length - 1));
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const cand = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    const e = b.length - 1;
    if (b.length < 316 || !ok(b, e - p.longWin, e)) continue;
    const sdLong = sdRet(b, e - (p.longWin - 1), e);
    if (!(sdLong > 0)) continue;
    cand.push({ s, v: sdRet(b, e - (p.shortWin - 1), e) / sdLong });
  }
  if (cand.length < p.top) return {};
  cand.sort((x, y) => x.v - y.v || byName(x, y));
  return equal(cand, p.top);
}
