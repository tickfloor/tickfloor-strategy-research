// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-mayer-buyzone-c",
  name: "Mayer Multiple buy zone: long while close < SMA200 (multiple < 1.0), crypto 1d x18",
  family: "tests-1010",
  source: "Trace Mayer 'Mayer Multiple' (price / 200d SMA, below 1 = accumulation zone)",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { sma: 200, below: 1.0 },
  warmup: 200,
};
export function signal(bars, i, ctx) {
  const m = bars[i].close / ctx.sma("close", ctx.params.sma);
  return m < ctx.params.below ? 1 : 0;
}
