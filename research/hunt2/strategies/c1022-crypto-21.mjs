// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-21). Frozen before code.
export const meta = {
  id: "c1022-crypto-21",
  name: "Trend held weekdays only: flat over the weekend",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { emaFast: 20, emaSlow: 100, exitDow: 5, exitHour: 20, entryDow: 1, entryHour: 0 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  const { emaFast, emaSlow, exitHour } = ctx.params;
  const b = bars[i];
  const d = dowOf(b), h = hourOf(b);
  const weekend = (d === 5 && h >= exitHour) || d === 6 || d === 0;
  const trend = ctx.ema("close", emaFast, i) > ctx.ema("close", emaSlow, i);
  return trend && !weekend ? 1 : 0;
}
