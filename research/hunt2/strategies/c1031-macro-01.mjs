export const meta = {
  id: "c1031-macro-01",
  name: "Fading-fear re-entry: buy equity ETFs when an elevated VIX has fallen 15% in a week",
  family: "volatility",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF"],
  holdBars: 10,
  params: { vixFloor: 20, fallRatio: 0.85, lag: 5, hold: 10 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const v0 = M(ctx, "VIXCLS", i, 0);
  const vLag = M(ctx, "VIXCLS", i, p.lag);
  if (v0 === null || vLag === null) return 0;
  return v0 >= p.vixFloor && v0 <= p.fallRatio * vLag ? 1 : 0;
}
