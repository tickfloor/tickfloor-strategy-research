// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-59). Frozen before code.
export const meta = {
  id: "c1022-crypto-59",
  name: "Relative volume by hour-of-day with a 24h breakout",
  family: "volatility",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 12,
  params: { days: 20, rvol: 3.0, don: 24, hold: 12 },
};

// base = mean volume of the same hour-of-day over the last `days` days (bars i-24, i-48, ..., i-24*days).
// rvol = volume[i] / base. Breakout of the prior 24-bar Donchian band on rvol >= threshold.
export function signal(bars, i, ctx) {
  const { days, rvol, don } = ctx.params;
  if (i < days * 24) return 0;
  let sum = 0;
  for (let d = 1; d <= days; d++) sum += bars[i - 24 * d].volume;
  const base = sum / days;
  if (!(base > 0)) return 0;
  if (bars[i].volume / base < rvol) return 0;
  const dc = ctx.donchian(don, i - 1);
  if (bars[i].close > dc.upper) return 1;
  if (bars[i].close < dc.lower) return -1;
  return 0;
}
