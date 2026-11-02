// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-08). Andersen, Bollerslev, Diebold & Labys (2003) Econometrica 71(2); Engle (1982) Econometrica 50(4)
export const meta = {
  id: "c1031-overlay-08",
  name: "Hourly crypto volatility-expansion gate: flat while 24-hour volatility exceeds 1.75x the 30-day hourly volatility",
  family: "volatility",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: false,
  params: { shortBars: 24, longBars: 720, ratioMax: 1.75 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.longBars + 1) return 0;
  const s24 = ctx.rollingStd("ret", p.shortBars, i);
  const s720 = ctx.rollingStd("ret", p.longBars, i);
  if (!Number.isFinite(s24) || !Number.isFinite(s720)) return 0;
  if (s720 === 0) return 1;
  return s24 > p.ratioMax * s720 ? 0 : 1;
}
