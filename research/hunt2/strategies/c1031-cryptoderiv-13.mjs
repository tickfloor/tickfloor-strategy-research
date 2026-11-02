export const meta = {
  id: "c1031-cryptoderiv-13",
  name: "Hourly EMA(24/120) trend confirmed by 24-bar mean funding",
  family: "trend",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { fast: 24, slow: 120, fdN: 24 },
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
  const m = fdm(ctx, p.fdN, i);
  if (m === undefined) return 0;
  const e1 = ctx.ema("close", p.fast, i);
  const e2 = ctx.ema("close", p.slow, i);
  if (e1 > e2 && m > 0) return 1;
  if (e1 < e2 && m < 0) return -1;
  return 0;
}
