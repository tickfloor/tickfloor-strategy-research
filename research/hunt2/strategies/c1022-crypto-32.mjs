// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-32). Frozen before code.
export const meta = {
  id: "c1022-crypto-32",
  name: "Three-day range compression then breakout",
  family: "volatility",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 5,
  params: { days: 3, frac: 0.7, atr: 20, hold: 5 },
};

export function signal(bars, i, ctx) {
  const { days, frac, atr } = ctx.params;
  if (i < days + 1) return 0;
  const a = ctx.atr(atr, i - days - 1);
  let hi = -Infinity, lo = Infinity, comp = true;
  for (let k = i - days; k <= i - 1; k++) {
    if (!(bars[k].high - bars[k].low <= frac * a)) comp = false;
    if (bars[k].high > hi) hi = bars[k].high;
    if (bars[k].low < lo) lo = bars[k].low;
  }
  if (!comp) return 0;
  if (bars[i].close > hi) return 1;
  if (bars[i].close < lo) return -1;
  return 0;
}
