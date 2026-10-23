// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-54). Frozen before code.
export const meta = {
  id: "c1022-crypto-54",
  name: "Turnover-participation filter on a trend",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { sWin: 20, lWin: 100, sma: 50 },
};

// dv = close * volume. part = mean dv over the last sWin bars > median dv over the last lWin bars.
// Long iff close > sma(close, sma) AND part.
export function signal(bars, i, ctx) {
  const { sWin, lWin, sma } = ctx.params;
  if (i < lWin - 1) return 0;
  let sShort = 0;
  for (let k = i - sWin + 1; k <= i; k++) sShort += bars[k].close * bars[k].volume;
  const meanShort = sShort / sWin;
  const v = [];
  for (let k = i - lWin + 1; k <= i; k++) v.push(bars[k].close * bars[k].volume);
  v.sort((a, b) => a - b);
  const m = v.length;
  const med = m % 2 ? v[(m - 1) / 2] : (v[m / 2 - 1] + v[m / 2]) / 2;
  const part = meanShort > med;
  return bars[i].close > ctx.sma("close", sma, i) && part ? 1 : 0;
}
