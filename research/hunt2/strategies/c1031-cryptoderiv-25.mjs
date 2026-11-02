// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-25). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-25",
  "name": "Re-leveraging after fear: funding turns positive within 10 days of fear",
  "family": "positioning",
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
  "holdBars": 20,
  "params": {
    "fngMax": 30,
    "look": 10,
    "fdN": 3,
    "fdCross": 0.00005,
    "hold": 20
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
  if (ctx.fearGreed(i) === null) return 0;
  let minF = Infinity, any = false;
  for (let j = Math.max(0, i - p.look + 1); j <= i; j++) {
    const v = ctx.fearGreed(j);
    if (v !== null) { any = true; if (v < minF) minF = v; }
  }
  if (!any) return 0;
  const f3 = fdm(ctx, 3, i), f3p = fdm(ctx, 3, i - 1);
  if (f3 === null || f3p === null) return 0;
  return minF <= p.fngMax && f3 > p.fdCross && f3p <= p.fdCross ? 1 : 0;
}
