// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-rsi30-crossback-c",
  name: "RSI(14) cross back above 30: enter on the cross up through 30, exit when RSI >= 50, crypto 1d x18",
  family: "tests-1010",
  source: "r/Daytrading and YouTube 'wait for RSI to leave oversold' variant of the RSI 30 rule",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { n: 14, level: 30, exit: 50 },
};
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (i < 1) return 0;
  const r = ctx.rsi(P.n, i), p = ctx.rsi(P.n, i - 1);
  if (s.pos === 0) { if (p < P.level && r >= P.level) s.pos = 1; }
  else if (r >= P.exit) s.pos = 0;
  return s.pos;
}
