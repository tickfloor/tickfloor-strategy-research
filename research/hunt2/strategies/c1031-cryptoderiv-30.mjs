// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-30). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-30",
  "name": "Funding-confirmed SMA(20/50) cross, long and short",
  "family": "trend",
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
  "longShort": true,
  "params": {
    "fast": 20,
    "slow": 50,
    "fdN": 30
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
  const f = ctx.sma("close", p.fast, i), s = ctx.sma("close", p.slow, i);
  if (f > s && m > 0) return 1;
  if (f < s && m < 0) return -1;
  return 0;
}
