export const meta = {
  "id": "c1031-macro-12",
  "name": "Oil/gold ratio above its 26-week mean: hold cyclical sectors, otherwise SHY",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "GLD",
    "XLI",
    "XLB",
    "XLF",
    "XLY",
    "SHY"
  ],
  "rebalance": "weekly",
  "params": {
    "meanWeeks": 26
  }
};

export function rank(universe, t, ctx) {
  const oil = ctx.macro("DCOILWTICO");
  if (oil === null || oil <= 5 || universe.GLD === undefined) return {};
  const gold = universe.GLD[universe.GLD.length - 1].close;
  const r = oil / gold;
  if (ctx.state.r === undefined) ctx.state.r = [];
  const h = ctx.state.r;
  h.push(r);
  const weeks = ctx.params.meanWeeks;
  if (h.length < weeks) return { SHY: 1 };
  const mean = h.slice(h.length - weeks).reduce((a, b) => a + b, 0) / weeks;
  return r > mean ? { XLI: 0.25, XLB: 0.25, XLF: 0.25, XLY: 0.25 } : { SHY: 1 };
}
