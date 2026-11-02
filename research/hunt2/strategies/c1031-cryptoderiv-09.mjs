export const meta = {
  id: "c1031-cryptoderiv-09",
  name: "New shorts opening into a 3-day drop: short continuation",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 4,
  params: { n: 3, ret: -0.05, oiG: 0.05, hold: 4 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.n) return 0;
  const oiNow = ctx.openInterest(i);
  const oiPrev = ctx.openInterest(i - p.n);
  if (oiNow === null || oiPrev === null) return 0;
  const r3 = bars[i].close / bars[i - p.n].close - 1;
  const d = oiNow / oiPrev - 1;
  return r3 <= p.ret && d >= p.oiG ? -1 : 0;
}
