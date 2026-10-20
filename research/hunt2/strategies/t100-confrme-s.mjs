// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-confrme-s",
  "name": "RSI + MACD + EMA200 confluence: RSI>50, MACD above signal, close above 200 EMA (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "YouTube/Reddit 'RSI, MACD and EMA' combos (r/Daytrading 1w8i9my); TradingView 2025 multi-indicator behaviour",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "fast": 12,
    "slow": 26,
    "sig": 9,
    "rsi": 14,
    "ema": 200
  },
  "warmup": 199
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const m = ctx.ema("close", P.fast) - ctx.ema("close", P.slow);
  if (!(m === m)) return 0;
  s.sig = s.sig === undefined ? m : s.sig + (2 / (P.sig + 1)) * (m - s.sig);
  s.k = (s.k || 0) + 1;
  if (s.k < P.sig) return 0;
  const hist = m - s.sig;
  const r = ctx.rsi(P.rsi), e = ctx.ema("close", P.ema);
  if (!(r === r) || !(e === e)) return 0;
  return r > 50 && hist > 0 && b.close > e ? 1 : 0;
}
