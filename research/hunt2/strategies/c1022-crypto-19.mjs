// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-19). Frozen before code.
export const meta = {
  id: "c1022-crypto-19",
  name: "Weekend move reversal on Monday-Wednesday",
  family: "mean_reversion",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 3,
  params: { minMove: 0.03, hold: 3 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  const { minMove } = ctx.params;
  if (dowOf(bars[i]) !== 0) return 0;
  let j = i - 1;
  while (j >= 0 && j >= i - 7 && dowOf(bars[j]) !== 5) j--;
  if (j < 0 || dowOf(bars[j]) !== 5) return 0;
  const w = bars[i].close / bars[j].close - 1;
  if (w >= minMove) return -1;
  if (w <= -minMove) return 1;
  return 0;
}
