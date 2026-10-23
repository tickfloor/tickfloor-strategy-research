export const meta = {
  id: "c1022-macro-11",
  name: "VIX low-and-rising early warning on sector ETFs",
  family: "volatility",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  params: { level: 20, jump: 0.25, lookback: 5, standDown: 10 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.off === undefined) ctx.state.off = -1;
  const v = ctx.macro("VIX", i);
  const past = i - p.lookback >= 0 ? ctx.macro("VIX", i - p.lookback) : null;
  if (v !== null && past !== null && v < p.level && v / past - 1 > p.jump) {
    ctx.state.off = i + p.standDown;
  }
  return i < ctx.state.off ? 0 : 1;
}
