// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-25). Frozen before code.
export const meta = {
  id: "c1022-crypto-25",
  name: "Weekly options expiry (Friday 08:00 UTC) breakout",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 6,
  params: { expiryHour: 8, windowHours: 8, lookback: 24, hold: 6 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  const { expiryHour, windowHours, lookback } = ctx.params;
  const b = bars[i];
  const d = dowOf(b), h = hourOf(b);
  if (d !== 5 || h < expiryHour || h >= expiryHour + windowHours) return 0;
  const dc = ctx.donchian(lookback, i - 1);
  if (b.close > dc.upper) return 1;
  if (b.close < dc.lower) return -1;
  return 0;
}
