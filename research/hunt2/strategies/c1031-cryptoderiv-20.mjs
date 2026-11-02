export const meta = {
  id: "c1031-cryptoderiv-20",
  name: "Fear streak exhaustion: first neutral close after 7+ days of fear",
  family: "sentiment",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 20,
  params: { fearMax: 35, streak: 7, hold: 20 },
};

// ctx.state.s = consecutive fear bars (fng < fearMax) ending at i-1
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.s === undefined) ctx.state.s = 0;
  const s = ctx.state.s;
  const fng = ctx.fearGreed(i);
  if (fng === null) { ctx.state.s = 0; return 0; }
  const sig = fng >= p.fearMax && s >= p.streak ? 1 : 0;
  ctx.state.s = fng < p.fearMax ? s + 1 : 0;
  return sig;
}
