// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-cumrsi2-s",
  name: "Connors cumulative RSI(2): buy when 2-day sum of RSI(2) < 35 above SMA200, exit on close > SMA5, US stocks 1d x40",
  family: "tests-1010",
  source: "Larry Connors 'Short Term Trading Strategies That Work' cumulative RSI",
  assetClass: "us_stock",
  timeframe: "1d",
  longShort: false,
  params: { rsiLen: 2, sumDays: 2, entry: 35, trend: 200, exitSma: 5 },
  warmup: 200,
};
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (i < 1) return 0;
  const c = bars[i].close;
  if (s.pos === 0) {
    const cum = ctx.rsi(P.rsiLen, i) + ctx.rsi(P.rsiLen, i - 1);
    if (cum < P.entry && c > ctx.sma("close", P.trend)) s.pos = 1;
  } else if (c > ctx.sma("close", P.exitSma)) s.pos = 0;
  return s.pos;
}
