// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-20). Frozen before code.
export const meta = {
  id: "c1022-crypto-20",
  name: "US equity-open hour momentum in crypto",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 3,
  params: { openHour: 13, minRet: 0.005, hold: 3 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  const { openHour, minRet } = ctx.params;
  const b = bars[i];
  const d = dowOf(b), h = hourOf(b);
  if (d < 1 || d > 5 || h !== openHour) return 0;
  const r = b.close / b.open - 1;
  if (r >= minRet) return 1;
  if (r <= -minRet) return -1;
  return 0;
}
