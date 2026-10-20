// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-scalp1h-h",
  "name": "Hourly scalp combo: EMA 9/21 trend, MACD side, RSI 50-70 long or 30-50 short (crypto 1h x8)",
  "family": "top100-1006",
  "source": "YouTube Data Trader 'The BEST 5 Minute Scalping Strategy' 1.7M views (EMA + MACD + RSI + BB filters); hourly proxy, the harness has no 5-minute bars",
  "assetClass": "crypto",
  "timeframe": "1h",
  "longShort": true,
  "params": {
    "fast": 12,
    "slow": 26,
    "sig": 9,
    "rsi": 14
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
  const e9 = ctx.ema("close", 9), e21 = ctx.ema("close", 21), r = ctx.rsi(P.rsi);
  if (!(e9 === e9) || !(e21 === e21) || !(r === r)) return 0;
  if (e9 > e21 && hist > 0 && r > 50 && r < 70) return 1;
  if (e9 < e21 && hist < 0 && r < 50 && r > 30) return -1;
  return 0;
}
