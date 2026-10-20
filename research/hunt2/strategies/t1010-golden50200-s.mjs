// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-golden50200-s",
  name: "Golden cross: long while SMA50 > SMA200, US stocks 1d x40",
  family: "tests-1010",
  source: "Investopedia / countless YouTube 'golden cross strategy'",
  assetClass: "us_stock",
  timeframe: "1d",
  longShort: false,
  params: { fast: 50, slow: 200 },
  warmup: 200,
};
export function signal(bars, i, ctx) {
  const f = ctx.sma("close", ctx.params.fast), s = ctx.sma("close", ctx.params.slow);
  return f > s ? 1 : 0;
}
