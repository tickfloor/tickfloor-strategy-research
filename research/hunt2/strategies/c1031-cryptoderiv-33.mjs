// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-33). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-33",
  "name": "Hourly oversold bounce when funding is non-positive",
  "family": "mean-reversion",
  "source": "c1031/cryptoderiv",
  "assetClass": "crypto",
  "timeframe": "1h",
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
  "holdBars": 6,
  "params": {
    "fdN": 24,
    "fdMax": 0,
    "rsiN": 14,
    "rsiMax": 25,
    "hold": 6
  }
};

function fdm(ctx, n, k) {
  // mean of funding over bars k-n+1..k, nulls skipped; undefined (null) unless >= n/2 non-null
  if (k - n + 1 < 0) return null;
  let sum = 0, cnt = 0;
  for (let j = k - n + 1; j <= k; j++) { const v = ctx.fundingRate(j); if (v !== null) { sum += v; cnt++; } }
  return cnt >= n / 2 ? sum / cnt : null;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const m = fdm(ctx, p.fdN, i);
  if (m === null) return 0;
  const rsi = ctx.rsi(p.rsiN, i);
  return m <= p.fdMax && rsi <= p.rsiMax ? 1 : 0;
}
