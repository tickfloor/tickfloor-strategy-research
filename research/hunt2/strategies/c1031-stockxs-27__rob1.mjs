// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-27). Rising relative-strength rank among top-half names, top 8, monthly.
export const meta = {
  id: "c1031-stockxs-27__rob1",
  name: "Rising relative-strength rank: the 8 large caps in the top half on 126-day return whose rank improved most over the last 63 days, monthly (-25%)",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { win: 95, lag: 47, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);
function rankMap(items) {
  const s = [...items].sort((x, y) => x.v - y.v || byName(x, y));
  return new Map(s.map((it, p) => [it.sym, p + 1]));
}

export function rank(universe, t, ctx) {
  const { win, lag, top } = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < win + lag || !pos(b, e - win - lag, e)) continue;
    names.push({
      sym,
      now: b[e].close / b[e - win].close - 1,
      prev: b[e - lag].close / b[e - win - lag].close - 1,
    });
  }
  const n = names.length;
  const rkNow = rankMap(names.map((x) => ({ sym: x.sym, v: x.now })));
  const rkPrev = rankMap(names.map((x) => ({ sym: x.sym, v: x.prev })));
  const cands = names
    .filter((x) => rkNow.get(x.sym) > n / 2)
    .map((x) => ({ sym: x.sym, s: rkNow.get(x.sym) - rkPrev.get(x.sym) }));
  if (cands.length < 3) return {};
  cands.sort((x, y) => y.s - x.s || byName(x, y));
  const w = {};
  for (const p of cands.slice(0, top)) w[p.sym] = 1 / top;
  return w;
}
