// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-rsi70-momo-c",
  name: "RSI(14) momentum: buy when RSI > 70, exit when RSI < 50, crypto 1d x18",
  family: "tests-1010",
  source: "YouTube/TradingView 'overbought is bullish' RSI momentum rule",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { n: 14, entry: 70, exit: 50 },
};
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const r = ctx.rsi(P.n, i);
  if (!(r === r)) return 0;
  if (s.pos === 0) { if (r > P.entry) s.pos = 1; }
  else if (r < P.exit) s.pos = 0;
  return s.pos;
}
