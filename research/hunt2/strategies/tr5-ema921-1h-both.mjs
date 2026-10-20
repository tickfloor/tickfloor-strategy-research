// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-ema921-1h-both",
  name: "9/21 EMA cross on hourly crypto, always in: long when 9 is above 21, short when below",
  family: "trending-1005",
  source: "YouTube Trade Hunter '9-21 EMA Intraday Trading Strategy' (Aug 2026) and '9-21 EMA Strategy Tested on 100 Trades' (Sep 2026)",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: true,
  params: { fast: 9, slow: 21, warmupBars: 30 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params;
  if (i < P.warmupBars) return 0;
  const f = ctx.ema("close", P.fast), s = ctx.ema("close", P.slow);
  if (!(f === f) || !(s === s)) return 0;
  return f > s ? 1 : -1;
}
