// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-08). Source: Alexander 1961, Industrial Management Review 2(2), 7-26; Fama & Blume 1966, Journal of Bus
export const meta = {
  id: "c1031-acad4-08",
  name: "Alexander filter rule at 20% on crypto: buy after a 20% rise from the trough, sell after a 20% fall from the peak, 18 coins",
  family: "trend",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: false,
  params: { x: 0.2 },
};

export function signal(bars, i, ctx) {
  const x = ctx.params.x;
  const c = bars[i].close;
  if (ctx.state.ext === undefined) { ctx.state.pos = 0; ctx.state.ext = c; }
  if (ctx.state.pos === 0) {
    ctx.state.ext = Math.min(ctx.state.ext, c);
    if (c >= ctx.state.ext * (1 + x)) { ctx.state.pos = 1; ctx.state.ext = c; }
  } else {
    ctx.state.ext = Math.max(ctx.state.ext, c);
    if (c <= ctx.state.ext * (1 - x)) { ctx.state.pos = 0; ctx.state.ext = c; }
  }
  return ctx.state.pos;
}
