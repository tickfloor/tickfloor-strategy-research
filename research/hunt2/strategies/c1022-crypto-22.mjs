// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-22). Frozen before code.
export const meta = {
  id: "c1022-crypto-22",
  name: "Post-monthly-options-expiry breakout window",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 5,
  params: { daysAfter: 3, don: 20, hold: 5 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;
function isLastFriday(b) {
  if (dowOf(b) !== 5) return false;
  const d = new Date(b.time * 1000);
  const dim = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  return d.getUTCDate() + 7 > dim;
}

export function signal(bars, i, ctx) {
  const { daysAfter, don } = ctx.params;
  const s = ctx.state;
  if (s.exp === undefined) s.exp = -1;
  if (isLastFriday(bars[i])) s.exp = i;
  if (s.exp < 0) return 0;
  const k = i - s.exp;
  if (k < 1 || k > daysAfter) return 0;
  const dc = ctx.donchian(don, i - 1);
  return bars[i].close > dc.upper ? 1 : 0;
}
