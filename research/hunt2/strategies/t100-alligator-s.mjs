// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-alligator-s",
  "name": "Williams Alligator: long while lips > teeth > jaw (13/8, 8/5, 5/3 smoothed medians) (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "YouTube Data Trader 'BEST William's Alligator' 605K views",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warm": 40
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const med = (b.high + b.low) / 2;
  const sm = (prev, x, n) => (prev === undefined ? x : (prev * (n - 1) + x) / n);
  s.j = sm(s.j, med, 13); s.t = sm(s.t, med, 8); s.l = sm(s.l, med, 5);
  if (!s.J) { s.J = []; s.T = []; s.L = []; }
  s.J.push(s.j); s.T.push(s.t); s.L.push(s.l);
  if (i < P.warm) return 0;
  const jaw = s.J[i - 8], teeth = s.T[i - 5], lips = s.L[i - 3];
  return lips > teeth && teeth > jaw ? 1 : 0;
}
