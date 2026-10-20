// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-ob-h",
  "name": "Order block / supply-demand zone retest: last opposing candle before a 1.5 ATR impulse, stop at the far edge, 2R target (crypto 1h x8)",
  "family": "top100-1006",
  "source": "OB tutorials top YouTube view counts (search result); TradingView SMC 78.2K likes; YouTube Data Trader supply & demand video 33.9K views",
  "assetClass": "crypto",
  "timeframe": "1h",
  "longShort": true,
  "params": {
    "imp": 1.5,
    "expire": 72,
    "maxHold": 24,
    "targetR": 2
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const A = ctx.atr(14);
  if (!(A === A) || i < 4) return 0;
  if (s.pos === undefined) { s.pos = 0; s.z = null; s.held = 0; }
  if (s.pos !== 0) {
    s.held++;
    const d = s.pos, c = b.close;
    if (d * (c - s.stop) <= 0 || d * (c - s.entry) >= P.targetR * s.R || s.held >= P.maxHold) s.pos = 0;
    return s.pos;
  }
  const o = bars[i - 3];
  if (o.close < o.open && b.close - o.high > P.imp * A) s.z = { d: 1, lo: o.low, hi: o.high, age: 0 };
  else if (o.close > o.open && o.low - b.close > P.imp * A) s.z = { d: -1, lo: o.low, hi: o.high, age: 0 };
  else {if (s.z) {
      s.z.age++;
      const z = s.z, c = b.close;
      if (z.age > P.expire) s.z = null;
      else if (z.d === 1 && b.low <= z.hi && c > z.lo) { s.pos = 1; s.entry = c; s.stop = z.lo; s.R = c - z.lo; s.held = 0; s.z = null; }
      else if (z.d === -1 && b.high >= z.lo && c < z.hi) { s.pos = -1; s.entry = c; s.stop = z.hi; s.R = z.hi - c; s.held = 0; s.z = null; }
    }
    return s.pos;
  }
  return s.pos;
}
