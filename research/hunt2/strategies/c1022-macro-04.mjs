export const meta = {
  id: "c1022-macro-04",
  name: "VIX3M below its 50-day average as the equity gate",
  family: "volatility",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { sma: 50 },
};

export function signal(bars, i, ctx) {
  if (ctx.state.roll === undefined) ctx.state.roll = ctx.rolling(ctx.params.sma);
  const v = ctx.macro("VIX3M", i);
  if (v === null) return 1; // prereg fix: benchmark-neutral while VIX3M is null
  const roll = ctx.state.roll;
  roll.push(v);
  if (!roll.full()) return 1; // prereg fix: benchmark-neutral until the window fills
  return v < roll.mean() ? 1 : 0;
}
