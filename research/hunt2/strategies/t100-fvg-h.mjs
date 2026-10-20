// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-fvg-h",
  "name": "ICT fair value gap retest: trade the first return into a 3-bar gap, stop at the far edge, 2R target (crypto 1h x8)",
  "family": "top100-1006",
  "source": "TradingView Smart Money Concepts [LuxAlgo] 78.2K likes; YouTube Smart Risk 'I Tested Every ICT Gap Strategy' 24.4K views; 240 Reddit ICT/SMC/FVG posts (Sep 2026)",
  "assetClass": "crypto",
  "timeframe": "1h",
  "longShort": true,
  "params": {
    "minGap": 0.5,
    "expire": 48,
    "maxHold": 24,
    "targetR": 2
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const A = ctx.atr(14);
  if (!(A === A) || i < 3) return 0;
  if (s.pos === undefined) { s.pos = 0; s.z = null; s.held = 0; }
  if (s.pos !== 0) {
    s.held++;
    const d = s.pos, c = b.close;
    if (d * (c - s.stop) <= 0 || d * (c - s.entry) >= P.targetR * s.R || s.held >= P.maxHold) s.pos = 0;
    return s.pos;
  }
  const a = bars[i - 2], m = bars[i - 1];
  if (b.low > a.high && m.close > m.open && b.low - a.high > P.minGap * A) s.z = { d: 1, lo: a.high, hi: b.low, age: 0 };
  else if (b.high < a.low && m.close < m.open && a.low - b.high > P.minGap * A) s.z = { d: -1, lo: b.high, hi: a.low, age: 0 };
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
