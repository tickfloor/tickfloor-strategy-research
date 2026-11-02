// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-24). OBV flow rank minus price rank, top 8, monthly.
export const meta = {
  id: "c1031-stockxs-24",
  name: "Volume-price divergence: the 8 large caps where 63-day volume flow most exceeds their price rank, monthly",
  family: "volume",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { window: 63, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);
function rankMap(items) {
  const s = [...items].sort((x, y) => x.v - y.v || byName(x, y));
  return new Map(s.map((it, p) => [it.sym, p + 1]));
}

export function rank(universe, t, ctx) {
  const W = ctx.params.window;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < W + 1 || !pos(b, e - W, e)) continue;
    let obv = 0, vol = 0;
    for (let k = e - W + 1; k <= e; k++) {
      obv += Math.sign(b[k].close - b[k - 1].close) * b[k].volume;
      vol += b[k].volume;
    }
    if (vol === 0) continue;
    names.push({ sym, A: obv / vol, P: b[e].close / b[e - W].close - 1 });
  }
  const rA = rankMap(names.map((n) => ({ sym: n.sym, v: n.A })));
  const rP = rankMap(names.map((n) => ({ sym: n.sym, v: n.P })));
  const sc = names.map((n) => ({ sym: n.sym, s: rA.get(n.sym) - rP.get(n.sym) }));
  if (sc.length < ctx.params.top) return {};
  sc.sort((x, y) => y.s - x.s || byName(x, y));
  const w = {};
  for (const p of sc.slice(0, ctx.params.top)) w[p.sym] = 1 / ctx.params.top;
  return w;
}
