export const meta = {
  id: "c1022-macro-05",
  name: "VIX golden cross (50d over 200d) as risk-off",
  family: "volatility",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { fast: 50, slow: 200 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.fast === undefined) {
    ctx.state.fast = ctx.rolling(p.fast);
    ctx.state.slow = ctx.rolling(p.slow);
  }
  const v = ctx.macro("VIX", i);
  if (v !== null) {
    ctx.state.fast.push(v);
    ctx.state.slow.push(v);
  }
  if (!ctx.state.fast.full() || !ctx.state.slow.full()) return 0;
  return ctx.state.fast.mean() < ctx.state.slow.mean() ? 1 : 0;
}
