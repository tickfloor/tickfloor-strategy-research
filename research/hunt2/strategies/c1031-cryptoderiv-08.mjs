export const meta = {
  id: "c1031-cryptoderiv-08",
  name: "Coin-denominated open-interest build in an uptrend",
  family: "participation",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { n: 14, g: 0.1, sma: 50 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const oiNow = ctx.openInterest(i);
  const oiPrev = i >= p.n ? ctx.openInterest(i - p.n) : null;
  const s = ctx.sma("close", p.sma, i);
  if (oiNow === null || oiPrev === null || !Number.isFinite(s)) {
    ctx.state.pos = 0;
    return 0;
  }
  const coinNow = oiNow / bars[i].close;
  const coinPrev = oiPrev / bars[i - p.n].close;
  const g = coinNow / coinPrev - 1;
  if (ctx.state.pos === 0) {
    if (g > p.g && bars[i].close > s) ctx.state.pos = 1;
  } else if (g <= 0 || bars[i].close <= s) {
    ctx.state.pos = 0;
  }
  return ctx.state.pos;
}
