export const meta = {
  id: "c1031-cryptoderiv-22",
  name: "Sentiment residual: Fear & Greed z-score minus 20-day return z-score",
  family: "sentiment",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: true,
  holdBars: 10,
  params: { win: 90, retN: 20, z: 1.5, hold: 10 },
};

// z-score of the last value of arr against arr (population std); null if std is 0
function zLast(arr) {
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / n);
  return sd === 0 ? null : (arr[n - 1] - mean) / sd;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.f === undefined) { ctx.state.f = []; ctx.state.r = []; }
  const fng = ctx.fearGreed(i);
  const r20 = i >= p.retN ? bars[i].close / bars[i - p.retN].close - 1 : null;
  if (fng !== null && r20 !== null) {
    ctx.state.f.push(fng);
    ctx.state.r.push(r20);
    if (ctx.state.f.length > p.win) { ctx.state.f.shift(); ctx.state.r.shift(); }
  }
  if (fng === null || r20 === null || ctx.state.f.length < p.win) return 0;
  const zF = zLast(ctx.state.f);
  const zR = zLast(ctx.state.r);
  if (zF === null || zR === null) return 0;
  const res = zF - zR;
  if (res <= -p.z) return 1;
  if (res >= p.z) return -1;
  return 0;
}
