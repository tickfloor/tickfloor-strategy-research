// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-deathcross-short-c",
  name: "Death cross short: short while SMA50 < SMA200, flat otherwise, crypto 1d x18",
  family: "tests-1010",
  source: "YouTube 'death cross' bearish-signal videos; short-side twin of the golden cross",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: true,
  params: { fast: 50, slow: 200 },
  warmup: 200,
};
export function signal(bars, i, ctx) {
  const f = ctx.sma("close", ctx.params.fast), s = ctx.sma("close", ctx.params.slow);
  return f < s ? -1 : 0;
}
