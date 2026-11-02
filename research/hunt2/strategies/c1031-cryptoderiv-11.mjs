export const meta = {
  id: "c1031-cryptoderiv-11",
  name: "Open-interest shock day: follow the day's direction for 3 days",
  family: "momentum",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 3,
  params: { oiShock: 0.06, minRet: 0.03, hold: 3 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 1) return 0;
  const oi = ctx.openInterest(i);
  const oiPrev = ctx.openInterest(i - 1);
  if (oi === null || oiPrev === null) return 0;
  const d = oi / oiPrev - 1;
  const r1 = bars[i].close / bars[i - 1].close - 1;
  if (d < p.oiShock) return 0;
  if (r1 >= p.minRet) return 1;
  if (r1 <= -p.minRet) return -1;
  return 0;
}
