// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-11). Source: Chan 2003, 'Stock price reaction to news and no-news: drift and reversal after headlines',
export const meta = {
  id: "c1031-acad4-11",
  name: "Fade large no-news moves: short or buy 5%+ one-day moves that came on under 1.5x normal volume, hold 10 sessions (Chan)",
  family: "mean_reversion",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  longShort: true,
  holdBars: 10,
  params: { minMove: 0.05, volRatioMax: 1.5, hold: 10 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 21) return 0;
  const r = bars[i].close / bars[i - 1].close - 1;
  if (Math.abs(r) < p.minMove) return 0;
  const vbar = ctx.rollingMean("volume", 20, i - 1);
  if (!(vbar > 0)) return 0;
  return bars[i].volume / vbar < p.volRatioMax ? -Math.sign(r) : 0;
}
