// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-wavetrend-c",
  "name": "WaveTrend (LazyBear 10/21): buy a cross-up below -53, sell any cross-down (crypto 1d x18)",
  "family": "top100-1006",
  "source": "TradingView WaveTrend Oscillator [LazyBear] 52.3K likes",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n1": 10,
    "n2": 21,
    "os": 53,
    "warm": 60
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const ap = (b.high + b.low + b.close) / 3;
  const e = (prev, x, n) => (prev === undefined ? x : prev + (2 / (n + 1)) * (x - prev));
  s.esa = e(s.esa, ap, P.n1);
  s.d = e(s.d, Math.abs(ap - s.esa), P.n1);
  const ci = s.d > 0 ? (ap - s.esa) / (0.015 * s.d) : 0;
  s.wt1 = e(s.wt1, ci, P.n2);
  if (!s.h) s.h = [];
  s.h.push(s.wt1);
  if (s.h.length > 4) s.h.shift();
  if (s.h.length < 4 || i < P.warm) return 0;
  const wt1 = s.wt1, wt2 = (s.h[0] + s.h[1] + s.h[2] + s.h[3]) / 4;
  const up = s.pw1 !== undefined && s.pw1 <= s.pw2 && wt1 > wt2;
  const dn = s.pw1 !== undefined && s.pw1 >= s.pw2 && wt1 < wt2;
  s.pw1 = wt1; s.pw2 = wt2;
  if (s.pos === undefined) s.pos = 0;
  if (s.pos === 0 && up && wt1 < -P.os) s.pos = 1; else if (s.pos === 1 && dn) s.pos = 0;
  return s.pos;
}
