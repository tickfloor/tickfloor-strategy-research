export const meta = {
  id: "c1031-cryptoderiv-04",
  name: "Unlevered rally: 10-day gain while funding fell, long continuation",
  family: "carry",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 10,
  params: { n: 10, ret: 0.1, fdN: 5, fdMax: 0.0001, hold: 10 },
};

// fdm(n, k): mean funding over bars k-n+1..k, skipping nulls; null unless >= n/2 non-null.
function fdm(n, k, ctx) {
  if (k - n + 1 < 0) return null;
  let sum = 0;
  let cnt = 0;
  for (let j = k - n + 1; j <= k; j++) {
    const v = ctx.fundingRate(j);
    if (v !== null) { sum += v; cnt++; }
  }
  if (cnt < n / 2) return null;
  return sum / cnt;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.n) return 0;
  const r10 = bars[i].close / bars[i - p.n].close - 1;
  const m = fdm(p.fdN, i, ctx);
  const mPrev = fdm(p.fdN, i - p.n, ctx);
  if (m === null || mPrev === null) return 0;
  return r10 >= p.ret && m < mPrev && m <= p.fdMax ? 1 : 0;
}
