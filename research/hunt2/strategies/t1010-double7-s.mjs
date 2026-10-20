// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-double7-s",
  name: "Connors Double 7: buy a 7-day closing low above SMA200, sell a 7-day closing high, US stocks 1d x40",
  family: "tests-1010",
  source: "Larry Connors / QuantifiedStrategies 'Double 7' strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  longShort: false,
  params: { n: 7, trend: 200 },
  warmup: 200,
};
export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (i < P.n) return 0;
  const c = bars[i].close;
  let lo = Infinity, hi = -Infinity;
  for (let k = i - P.n + 1; k <= i; k++) { lo = Math.min(lo, bars[k].close); hi = Math.max(hi, bars[k].close); }
  if (s.pos === 0) { if (c <= lo && c > ctx.sma("close", P.trend)) s.pos = 1; }
  else if (c >= hi) s.pos = 0;
  return s.pos;
}
