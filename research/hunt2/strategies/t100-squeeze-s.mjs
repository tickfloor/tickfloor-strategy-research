// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-squeeze-s",
  "name": "Squeeze Momentum (LazyBear): enter on release of Bollinger-inside-Keltner squeeze, exit when momentum crosses zero (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "TradingView Squeeze Momentum [LazyBear] 97.4K likes, the most-liked indicator",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n": 20,
    "bb": 2,
    "kc": 1.5,
    "shorts": false
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const n = P.n;
  const mu = ctx.sma("close", n), sd = ctx.rollingStd("close", n), a = ctx.atr(n), d = ctx.donchian(n);
  if (!(mu === mu) || !(sd === sd) || !(a === a) || !d || !(d.upper === d.upper)) return 0;
  const on = mu - P.bb * sd > mu - P.kc * a && mu + P.bb * sd < mu + P.kc * a;
  const val = b.close - ((d.upper + d.lower) / 2 + mu) / 2;
  if (!s.v) s.v = [];
  s.v.push(val);
  if (s.v.length > n) s.v.shift();
  if (s.v.length < n) { s.on = on; return 0; }
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let k = 0; k < n; k++) { sx += k; sy += s.v[k]; sxy += k * s.v[k]; sxx += k * k; }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const mom = (sy - slope * sx) / n + slope * (n - 1);
  const release = s.on === true && !on;
  s.on = on;
  if (s.pos === undefined) s.pos = 0;
  if (s.pos === 0 && release) { if (mom > 0) s.pos = 1; else if (mom < 0 && P.shorts) s.pos = -1; }
  else if (s.pos === 1 && mom <= 0) s.pos = 0;
  else if (s.pos === -1 && mom >= 0) s.pos = 0;
  return s.pos;
}
