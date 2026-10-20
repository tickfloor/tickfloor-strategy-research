// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-macd-s",
  "name": "MACD(12,26,9) line above signal, long only (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "TradingView MACD custom indicator 70.4K likes; Ciana survey 22.0%",
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
  return hist > 0 ? 1 : 0;
}
