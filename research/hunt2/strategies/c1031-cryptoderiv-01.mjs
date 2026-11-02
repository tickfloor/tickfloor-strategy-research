export const meta = {
  id: "c1031-cryptoderiv-01",
  name: "Trapped longs: weekly drop while longs still pay positive funding, short continuation",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 5,
  params: { n: 5, ret: -0.08, fdN: 3, fdMin: 0.0001, hold: 5 },
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
  const r = bars[i].close / bars[i - p.n].close - 1;
  const m = fdm(p.fdN, i, ctx);
  if (m === null) return 0;
  return r <= p.ret && m >= p.fdMin ? -1 : 0;
}
