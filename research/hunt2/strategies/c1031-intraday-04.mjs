// c1031-intraday-04: trend held only outside US cash hours (long-only).
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-04",
  name: "Trend held only outside US cash hours",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { emaBars: 336, flatFrom: 14, flatTo: 21 },
};

// Long when close is above the 336-bar EMA, except on bars that open 14:00-20:00 UTC (the next hour is in the flat window).
export function signal(bars, i, ctx) {
  const { emaBars, flatFrom, flatTo } = ctx.params;
  const e = ctx.ema("close", emaBars, i);
  const nextHour = (Math.floor(bars[i].time / 3600) % 24 + 1) % 24;
  const flat = nextHour >= flatFrom && nextHour < flatTo;
  return bars[i].close > e && !flat ? 1 : 0;
}
