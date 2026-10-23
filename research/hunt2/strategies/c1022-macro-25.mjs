export const meta = {
  id: "c1022-macro-25",
  name: "Stand aside in long-duration assets after a monthly real-rate shock",
  family: "macro",
  source: "c1022/macro", // cited: Feroli et al. (2014); duration-driven returns (Gormsen & Lazarus 2023)
  assetClass: "etf",
  timeframe: "1d",
  assets: ["VNQ", "XLU", "QQQ", "GLD"],
  params: { lookback: 20, bp: 0.4, standDown: 20 },
};

export function signal(bars, i, ctx) {
  if (ctx.state.off === undefined) ctx.state.off = 0;
  if (i - 20 >= 0) {
    const a = ctx.macro("DFII10", i), b = ctx.macro("DFII10", i - 20);
    if (a !== null && b !== null && a - b >= 0.4) ctx.state.off = i + 20;
  }
  return i < ctx.state.off ? 0 : 1;
}
