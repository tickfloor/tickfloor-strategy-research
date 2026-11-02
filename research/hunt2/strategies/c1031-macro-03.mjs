export const meta = {
  id: "c1031-macro-03",
  name: "Confirmed dip buy: 7% off the 63-day high while the VIX curve is inverted, 15-bar hold",
  family: "mean_reversion",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLI"],
  holdBars: 15,
  params: { ddThreshold: -0.07, highWindow: 63, hold: 15, ratioMin: 1 },
};

// M(ctx, id, i, k) = ctx.macro(id) known by the close of bar i-k; null if i-k < 0 or no value yet.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.highWindow - 1) return 0;
  let H = -Infinity;
  for (let k = i - (p.highWindow - 1); k <= i; k++) if (bars[k].close > H) H = bars[k].close;
  const dd = bars[i].close / H - 1;
  const vix = M(ctx, "VIX", i, 0);
  const vix3m = M(ctx, "VIX3M", i, 0);
  if (vix === null || vix3m === null) return 0;
  return dd <= p.ddThreshold && vix / vix3m > p.ratioMin ? 1 : 0;
}
