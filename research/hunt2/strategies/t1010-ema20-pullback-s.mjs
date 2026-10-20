// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-ema20-pullback-s",
  name: "Swing pullback to the rising 20 EMA: buy a touch-and-close-above in an EMA20 > EMA50 uptrend, exit on close < EMA50, US stocks 1d x40",
  family: "tests-1010",
  source: "Swing-trading YouTube 'buy the pullback to the 20 EMA'",
  assetClass: "us_stock",
  timeframe: "1d",
  longShort: false,
  params: { fast: 20, slow: 50 },
  warmup: 50,
};
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  if (s.pos === undefined) s.pos = 0;
  const f = ctx.ema("close", P.fast), sl = ctx.ema("close", P.slow);
  if (!(f === f && sl === sl)) return 0;
  if (s.pos === 0) { if (f > sl && b.close > sl && b.low <= f && b.close > f) s.pos = 1; }
  else if (b.close < sl) s.pos = 0;
  return s.pos;
}
