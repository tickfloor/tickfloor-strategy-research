// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-23). Frozen before code.
export const meta = {
  id: "c1022-crypto-23",
  name: "Post-quarterly-futures-expiry long",
  family: "seasonality",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 10,
  params: { hold: 10 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;
function isLastFriday(b) {
  if (dowOf(b) !== 5) return false;
  const d = new Date(b.time * 1000);
  const dim = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return d.getUTCDate() + 7 > dim;
}

export function signal(bars, i) {
  const b = bars[i];
  if (!isLastFriday(b)) return 0;
  const m = new Date(b.time * 1000).getUTCMonth();
  return [2, 5, 8, 11].includes(m) ? 1 : 0;
}
