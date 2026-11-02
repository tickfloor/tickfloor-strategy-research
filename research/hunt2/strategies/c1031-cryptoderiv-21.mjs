export const meta = {
  id: "c1031-cryptoderiv-21",
  name: "Greed streak exhaustion: first non-greedy close after 7+ days of greed, short",
  family: "sentiment",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 10,
  params: { greedMin: 70, streak: 7, hold: 10 },
};

// ctx.state.s = consecutive greed bars (fng >= greedMin) ending at i-1
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.s === undefined) ctx.state.s = 0;
  const s = ctx.state.s;
  const fng = ctx.fearGreed(i);
  if (fng === null) { ctx.state.s = 0; return 0; }
  const sig = fng < p.greedMin && s >= p.streak ? -1 : 0;
  ctx.state.s = fng >= p.greedMin ? s + 1 : 0;
  return sig;
}
