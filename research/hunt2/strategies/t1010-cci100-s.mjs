// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-cci100-s",
  name: "CCI(20) trend: long while CCI > +100, US stocks 1d x40",
  family: "tests-1010",
  source: "Donald Lambert CCI; 'CCI +100 breakout' YouTube trend videos",
  assetClass: "us_stock",
  timeframe: "1d",
  longShort: false,
  params: { n: 20, level: 100 },
};
export function signal(bars, i, ctx) {
  const n = ctx.params.n;
  if (i < n) return 0;
  const tp = (k) => (bars[k].high + bars[k].low + bars[k].close) / 3;
  let m = 0;
  for (let k = i - n + 1; k <= i; k++) m += tp(k);
  m /= n;
  let d = 0;
  for (let k = i - n + 1; k <= i; k++) d += Math.abs(tp(k) - m);
  d /= n;
  if (!(d > 0)) return 0;
  return (tp(i) - m) / (0.015 * d) > ctx.params.level ? 1 : 0;
}
