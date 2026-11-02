export const meta = {
  id: "c1031-cryptoderiv-18",
  name: "RSI(3) oversold dip bought only in fear",
  family: "mean-reversion",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 3,
  params: { rsiN: 3, rsiMax: 15, fngMax: 35, hold: 3 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const fng = ctx.fearGreed(i);
  if (fng === null) return 0;
  const rsi = ctx.rsi(p.rsiN, i);
  return rsi <= p.rsiMax && fng <= p.fngMax ? 1 : 0;
}
