// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-23), frozen before code.
export const meta = {
  id: "c1031-overlay-23",
  name: "Dow higher-low structure on crypto: hold a coin while its 20-bar low is above the low of the 20 bars before",
  family: "trend",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { win: 20 },
};

export function signal(bars, i, ctx) {
  const n = ctx.params.win;
  if (i < 40) return 0;
  const lowNow = ctx.donchian(n, i).lower;
  const lowPrev = ctx.donchian(n, i - n).lower;
  if (!Number.isFinite(lowNow) || !Number.isFinite(lowPrev)) return 0;
  return lowNow > lowPrev ? 1 : 0;
}
