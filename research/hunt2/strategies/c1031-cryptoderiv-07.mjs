export const meta = {
  id: "c1031-cryptoderiv-07",
  name: "Greed on the index but unlevered coin: long the disagreement",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 10,
  params: { fngMin: 70, fdN: 3, fdMax: 0.00005, hold: 10 },
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
  const fng = ctx.fearGreed(i);
  if (fng === null) return 0;
  const m = fdm(p.fdN, i, ctx);
  if (m === null) return 0;
  return fng >= p.fngMin && m <= p.fdMax ? 1 : 0;
}
