// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-gmma-c",
  name: "Guppy multiple moving average: long while all 6 short EMAs (3-15) sit above all 6 long EMAs (30-60), crypto 1d x18",
  family: "tests-1010",
  source: "Daryl Guppy GMMA, TradingView/YouTube ribbon videos",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { short: [3, 5, 8, 10, 12, 15], long: [30, 35, 40, 45, 50, 60] },
  warmup: 60,
};
export function signal(bars, i, ctx) {
  const P = ctx.params;
  let lo = Infinity, hi = -Infinity;
  for (const n of P.short) lo = Math.min(lo, ctx.ema("close", n));
  for (const n of P.long) hi = Math.max(hi, ctx.ema("close", n));
  return lo > hi ? 1 : 0;
}
