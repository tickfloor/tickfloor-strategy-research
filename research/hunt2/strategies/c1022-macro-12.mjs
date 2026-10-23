export const meta = {
  id: "c1022-macro-12",
  name: "Connors RSI(2) buys on ETFs only during VIX backwardation",
  family: "mean_reversion",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLY"],
  params: { rsi: 2, buy: 10, exit: 70, maxHold: 5 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.entry === undefined) ctx.state.entry = -1; // -1 = flat
  const r = ctx.rsi(p.rsi, i);
  if (ctx.state.entry >= 0) {
    if (r > p.exit || i - ctx.state.entry >= p.maxHold) {
      ctx.state.entry = -1;
      return 0;
    }
    return 1;
  }
  const v = ctx.macro("VIX", i);
  const v3 = ctx.macro("VIX3M", i);
  const sma200 = ctx.sma("close", 200, i);
  if (r < p.buy && v !== null && v3 !== null && v > v3 && Number.isFinite(sma200) && bars[i].close > sma200) {
    ctx.state.entry = i;
    return 1;
  }
  return 0;
}
