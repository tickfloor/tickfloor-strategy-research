// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-rsi3070-s",
  "name": "RSI(14) 30/70: buy below 30, sell above 70 (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "Ciana survey (RSI 44.4% of users); r/Daytrading RSI threads; most-used oscillator",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n": 14,
    "lo": 30,
    "hi": 70
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  if (s.pos === undefined) s.pos = 0;
  const r = ctx.rsi(P.n);
  if (!(r === r)) return 0;
  if (s.pos === 0 && r < P.lo) s.pos = 1; else if (s.pos === 1 && r > P.hi) s.pos = 0;
  return s.pos;
}
