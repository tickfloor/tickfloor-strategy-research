// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-bbbreak-c",
  name: "Bollinger breakout momentum: long when close > SMA20 + 2sd, exit when close < SMA20, crypto 1d x18",
  family: "tests-1010",
  source: "YouTube 'Bollinger band breakout' (ride the upper-band break, not fade it)",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { n: 20, k: 2 },
};
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, c = bars[i].close;
  if (s.pos === undefined) s.pos = 0;
  const m = ctx.sma("close", P.n), sd = ctx.rollingStd("close", P.n);
  if (!(m === m && sd === sd)) return 0;
  if (s.pos === 0) { if (c > m + P.k * sd) s.pos = 1; }
  else if (c < m) s.pos = 0;
  return s.pos;
}
