// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-macd-c__rob1",
  "name": "MACD(12,26,9) line above signal, long only (crypto 1d x18) (-25%)",
  "family": "top100-1006",
  "source": "TradingView MACD custom indicator 70.4K likes; Ciana survey 22.0%",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "fast": 9,
    "slow": 20,
    "sig": 7
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
