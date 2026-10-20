// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-ema921-daily-stocks",
  name: "9/21 EMA cross on daily US large caps, long only",
  family: "trending-1005",
  source: "YouTube Trade Hunter 9-21 EMA videos (Aug to Sep 2026); r/algotrading 1wledqw ('EMA 9 and EMA 21 aligned'); daily stock version",
  assetClass: "us_stock",
  timeframe: "1d",
  longShort: false,
  params: { fast: 9, slow: 21, warmupBars: 30 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params;
  if (i < P.warmupBars) return 0;
  const f = ctx.ema("close", P.fast), s = ctx.ema("close", P.slow);
  if (!(f === f) || !(s === s)) return 0;
  return f > s ? 1 : 0;
}
