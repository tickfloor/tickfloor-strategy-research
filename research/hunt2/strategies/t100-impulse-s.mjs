// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-impulse-s",
  "name": "Elder Impulse: long when EMA13 and MACD histogram both rise, flat when both fall, hold otherwise (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "TradingView Impulse MACD indicators; YouTube Data Trader 'Traded NEW IMPULSE MACD' 80.6K views; Elder, Come Into My Trading Room",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "fast": 12,
    "slow": 26,
    "sig": 9
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const m = ctx.ema("close", P.fast) - ctx.ema("close", P.slow);
  if (!(m === m)) return 0;
  s.sig = s.sig === undefined ? m : s.sig + (2 / (P.sig + 1)) * (m - s.sig);
  s.k = (s.k || 0) + 1;
  if (s.k < P.sig) return 0;
  const hist = m - s.sig;
  const e = ctx.ema("close", 13), e1 = ctx.ema("close", 13, i - 1);
  const ph = s.h;
  s.h = hist;
  if (!(e === e) || !(e1 === e1) || ph === undefined) return 0;
  if (s.pos === undefined) s.pos = 0;
  if (e > e1 && hist > ph) s.pos = 1; else if (e < e1 && hist < ph) s.pos = 0;
  return s.pos;
}
