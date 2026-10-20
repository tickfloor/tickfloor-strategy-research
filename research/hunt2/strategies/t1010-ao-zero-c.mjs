// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-ao-zero-c",
  name: "Awesome Oscillator zero-line cross: long while AO(5,34 on hl2) > 0, crypto 1d x18",
  family: "tests-1010",
  source: "Bill Williams Awesome Oscillator, TradingView/YouTube AO strategy videos",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { fast: 5, slow: 34 },
};
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  if (!s.f) { s.f = ctx.rolling(P.fast); s.s = ctx.rolling(P.slow); }
  const m = (b.high + b.low) / 2;
  s.f.push(m); s.s.push(m);
  if (!s.s.full()) return 0;
  return s.f.mean() - s.s.mean() > 0 ? 1 : 0;
}
