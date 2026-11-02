// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-32). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-32",
  "name": "Panic day: one-day Fear & Greed drop of 12+ points, buy",
  "family": "sentiment",
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
    "TRXUSDT",
    "BCHUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "DASHUSDT",
    "ZECUSDT",
    "AVAXUSDT",
    "UNIUSDT",
    "NEARUSDT",
    "AAVEUSDT",
    "HBARUSDT"
  ],
  "holdBars": 5,
  "params": {
    "drop": 12,
    "hold": 5
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 1) return 0;
  const a = ctx.fearGreed(i), b = ctx.fearGreed(i - 1);
  if (a === null || b === null) return 0;
  return b - a >= p.drop ? 1 : 0;
}
