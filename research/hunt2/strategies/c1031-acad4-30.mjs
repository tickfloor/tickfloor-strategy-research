// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-30). Same-hour 14-day open-band breakout on hourly crypto, flat over the day boundary
export const meta = {
  id: "c1031-acad4-30",
  name: "Same-hour 14-day volatility band breakout on hourly crypto, flat at 23:00 UTC",
  family: "momentum",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { lookbackDays: 14 },
};

export function signal(bars, i, ctx) {
  const L = ctx.params.lookbackDays;
  const h = Math.floor(bars[i].time / 3600) % 24;
  const j0 = i - h;
  if (j0 < 0 || bars[j0].time !== bars[i].time - 3600 * h) return 0;
  let sum = 0;
  for (let k = 1; k <= L; k++) {
    const a = i - 24 * k, b = j0 - 24 * k;
    if (a < 0 || b < 0 || bars[a].time !== bars[i].time - 86400 * k || bars[b].time !== bars[j0].time - 86400 * k) return 0;
    sum += Math.abs(bars[a].close / bars[b].open - 1);
  }
  if (h === 23) return 0;
  const sigma = sum / L;
  const openD = bars[j0].open;
  const upper = openD * (1 + sigma), lower = openD * (1 - sigma);
  if (bars[i].close > upper) return 1;
  if (bars[i].close < lower) return -1;
  return 0;
}
