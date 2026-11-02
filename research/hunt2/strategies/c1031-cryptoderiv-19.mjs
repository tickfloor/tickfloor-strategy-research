export const meta = {
  id: "c1031-cryptoderiv-19",
  name: "RSI(3) overbought spike shorted only in greed",
  family: "mean-reversion",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 3,
  params: { rsiN: 3, rsiMin: 90, fngMin: 70, hold: 3 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const fng = ctx.fearGreed(i);
  if (fng === null) return 0;
  const rsi = ctx.rsi(p.rsiN, i);
  return rsi >= p.rsiMin && fng >= p.fngMin ? -1 : 0;
}
