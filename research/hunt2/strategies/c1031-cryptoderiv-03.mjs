export const meta = {
  id: "c1031-cryptoderiv-03",
  name: "Funding acceleration exhaustion: fade a rally when funding jumps within a week",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 5,
  params: { fdN: 3, lag: 7, dFd: 0.00015, ret: 0.1, hold: 5 },
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
  if (i < p.lag) return 0;
  const m = fdm(p.fdN, i, ctx);
  const mLag = fdm(p.fdN, i - p.lag, ctx);
  if (m === null || mLag === null) return 0;
  const r7 = bars[i].close / bars[i - p.lag].close - 1;
  return m - mLag >= p.dFd && r7 >= p.ret ? -1 : 0;
}
