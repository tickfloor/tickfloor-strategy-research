export const meta = {
  id: "c1031-macro-02",
  name: "VIX Schmitt trigger: leave equity ETFs when VIX closes at 22 or more, return only once it is back to 17 or less",
  family: "volatility",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLI"],
  params: { outAt: 22, inAt: 17 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.inPos === undefined) ctx.state.inPos = 1;
  const v = M(ctx, "VIXCLS", i, 0);
  if (v === null) return 0;
  if (ctx.state.inPos === 1 && v >= p.outAt) ctx.state.inPos = 0;
  else if (ctx.state.inPos === 0 && v <= p.inAt) ctx.state.inPos = 1;
  return ctx.state.inPos;
}
