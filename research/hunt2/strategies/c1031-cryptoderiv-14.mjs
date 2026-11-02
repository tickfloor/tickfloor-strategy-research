export const meta = {
  id: "c1031-cryptoderiv-14",
  name: "24h long-liquidation bottom: price and open interest both drop, buy",
  family: "mean-reversion",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  holdBars: 24,
  params: { n: 24, ret: -0.04, oiG: -0.05, hold: 24 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.n) return 0;
  const oi = ctx.openInterest(i);
  const oiPrev = ctx.openInterest(i - p.n);
  if (oi === null || oiPrev === null) return 0;
  const r = bars[i].close / bars[i - p.n].close - 1;
  const d = oi / oiPrev - 1;
  return r <= p.ret && d <= p.oiG ? 1 : 0;
}
