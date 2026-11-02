// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-26). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-26",
  "name": "Open interest shrinking while price breaks a 10-day high",
  "family": "mean-reversion",
  "source": "c1031/cryptoderiv",
  "assetClass": "crypto",
  "timeframe": "1d",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT"
  ],
  "holdBars": 7,
  "params": {
    "oiN": 10,
    "oiG": -0.05,
    "donN": 10,
    "hold": 7
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.oiN || i < 1) return 0;
  const o1 = ctx.openInterest(i), o0 = ctx.openInterest(i - p.oiN);
  if (o1 === null || o0 === null) return 0;
  const d = o1 / o0 - 1;
  const up = ctx.donchian(p.donN, i - 1).upper;
  return d <= p.oiG && bars[i].close > up ? 1 : 0;
}
