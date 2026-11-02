// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-27). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-27",
  "name": "Paid-to-hold trend: long while weekly funding is negative and price above 20-day mean",
  "family": "carry",
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
  "params": {
    "fdN": 7,
    "fdEntry": 0,
    "fdExit": 0.0001,
    "sma": 20
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
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const m = fdm(ctx, p.fdN, i);
  if (m === null) { ctx.state.pos = 0; return 0; }
  const c = bars[i].close, sma = ctx.sma("close", p.sma, i);
  if (ctx.state.pos === 1) {
    if (m >= p.fdExit || c <= sma) ctx.state.pos = 0;
  } else if (m < p.fdEntry && c > sma) {
    ctx.state.pos = 1;
  }
  return ctx.state.pos;
}
