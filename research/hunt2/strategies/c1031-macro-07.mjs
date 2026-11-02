export const meta = {
  id: "c1031-macro-07",
  name: "VIX-adaptive trend lookback: 50-day average when VIX is 20 or more, 200-day average when it is below",
  family: "trend",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLI", "XLV"],
  params: { fast: 50, slow: 200, vixSplit: 20 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const v = M(ctx, "VIXCLS", i, 0);
  if (v === null) return 0;
  const L = v >= p.vixSplit ? p.fast : p.slow;
  return bars[i].close > ctx.sma("close", L) ? 1 : 0; // NaN sma (window not full) -> 0
}
