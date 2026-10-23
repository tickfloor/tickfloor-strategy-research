// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-26). Frozen before code.
export const meta = {
  id: "c1022-crypto-26",
  name: "Hourly trend only during US hours",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { emaFast: 9, emaSlow: 50, startHour: 13, endHour: 21 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  const { emaFast, emaSlow, startHour, endHour } = ctx.params;
  const b = bars[i];
  const d = dowOf(b), h = hourOf(b);
  if (d < 1 || d > 5 || h < startHour || h >= endHour) return 0;
  return ctx.ema("close", emaFast, i) > ctx.ema("close", emaSlow, i) ? 1 : 0;
}
