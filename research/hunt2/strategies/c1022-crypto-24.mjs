// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-24). Frozen before code.
export const meta = {
  id: "c1022-crypto-24",
  name: "Weekend-to-weekday volume ratio as a retail-participation fade",
  family: "mean_reversion",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 5,
  params: { ratio: 1.2, hold: 5 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  if (i < 6 || dowOf(bars[i]) !== 0) return 0;
  const { ratio } = ctx.params;
  // walk back instead of assuming contiguous bars: this weekend's Sat+Sun, prior Friday, preceding 5 weekday bars
  let j = i, wkSum = 0, wkN = 0;
  while (j >= 0 && bars[i].time - bars[j].time < 2 * 86400) { wkSum += bars[j].volume; wkN++; j--; }
  let fri = -1, wdSum = 0, wdN = 0;
  for (; j >= 0 && wdN < 5; j--) {
    const dj = dowOf(bars[j]);
    if (dj === 0 || dj === 6) break; // ran into the previous weekend: not enough weekday bars
    if (fri < 0 && dj === 5) fri = j;
    wdSum += bars[j].volume; wdN++;
  }
  if (fri < 0 || wdN < 5) return 0;
  const wkVol = wkSum / wkN, wdVol = wdSum / 5;
  if (!(wkVol / wdVol >= ratio)) return 0;
  const w = bars[i].close / bars[fri].close - 1;
  if (w > 0) return -1;
  if (w < 0) return 1;
  return 0;
}
