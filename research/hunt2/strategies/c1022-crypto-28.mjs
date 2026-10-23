// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-28). Frozen before code.
export const meta = {
  id: "c1022-crypto-28",
  name: "NR7 compression then next-day breakout (Crabel)",
  family: "volatility",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 3,
  params: { n: 7, hold: 3 },
};

export function signal(bars, i, ctx) {
  const { n } = ctx.params;
  if (i < n) return 0;
  const p = i - 1;
  const rp = bars[p].high - bars[p].low;
  for (let k = i - n; k < p; k++) if (bars[k].high - bars[k].low < rp) return 0;
  if (bars[i].close > bars[p].high) return 1;
  if (bars[i].close < bars[p].low) return -1;
  return 0;
}
