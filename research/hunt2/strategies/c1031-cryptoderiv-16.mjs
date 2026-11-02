export const meta = {
  id: "c1031-cryptoderiv-16",
  name: "Hourly fade of an upmove carried by high funding",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 12,
  params: { fdN: 24, fdMin: 0.0003, n: 24, ret: 0.04, hold: 12 },
};

// mean of settled funding over bars k-n+1..k (skip nulls); undefined unless >= n/2 non-null
function fdm(ctx, n, k) {
  let sum = 0, cnt = 0;
  for (let j = k - n + 1; j <= k; j++) {
    if (j < 0) continue;
    const v = ctx.fundingRate(j);
    if (v !== null) { sum += v; cnt++; }
  }
  return cnt >= n / 2 ? sum / cnt : undefined;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.n) return 0;
  const m = fdm(ctx, p.fdN, i);
  if (m === undefined) return 0;
  const r = bars[i].close / bars[i - p.n].close - 1;
  return m >= p.fdMin && r >= p.ret ? -1 : 0;
}
