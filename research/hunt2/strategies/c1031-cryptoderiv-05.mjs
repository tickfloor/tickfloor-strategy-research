export const meta = {
  id: "c1031-cryptoderiv-05",
  name: "Sustained 7-day funding extreme: fade crowded side in both directions",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 7,
  params: { n: 7, hi: 0.0004, lo: -0.0002, hold: 7 },
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
  const m = fdm(p.n, i, ctx);
  if (m === null) return 0;
  if (m >= p.hi) return -1;
  if (m <= p.lo) return 1;
  return 0;
}
