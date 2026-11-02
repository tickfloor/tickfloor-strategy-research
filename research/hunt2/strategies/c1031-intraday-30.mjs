// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-30).
export const meta = {
  id: "c1031-intraday-30",
  name: "Volatility-managed trend: long only when short-run vol is below long-run vol",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { fastEma: 48, slowEma: 336, volShort: 168, volLong: 2160 },
};

const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;

// stateless: position re-evaluated every bar
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (!contig(bars, i, p.volLong)) return 0;
  const e1 = ctx.ema("close", p.fastEma, i);
  const e2 = ctx.ema("close", p.slowEma, i);
  const v1 = ctx.rollingStd("ret", p.volShort, i);
  const v2 = ctx.rollingStd("ret", p.volLong, i);
  return e1 > e2 && v1 < v2 ? 1 : 0;
}
