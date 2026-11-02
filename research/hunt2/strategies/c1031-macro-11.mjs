export const meta = {
  "id": "c1031-macro-11",
  "name": "Oil/gold ratio falling over 13 weeks: hold intermediate and long Treasuries",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "GLD",
    "TLT",
    "IEF"
  ],
  "rebalance": "weekly",
  "params": {
    "lagWeeks": 13
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
  const lag = ctx.params.lagWeeks;
  if (h.length < lag + 1) return {};
  const chg = r / h[h.length - 1 - lag] - 1;
  return chg < 0 ? { TLT: 0.5, IEF: 0.5 } : {};
}
