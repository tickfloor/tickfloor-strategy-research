// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-10). Single-day drop reversal, 5-bar hold, wide US stock universe
export const meta = {
  id: "c1031-acad4-10",
  name: "One-day drop reversal: buy after a close-to-close fall of 7% or more, 5-bar hold, wide US stocks",
  family: "mean_reversion",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  longShort: false,
  holdBars: 5,
  params: { drop: -0.07, hold: 5 },
};

export function signal(bars, i, ctx) {
  if (i < 1) return 0;
  const r = bars[i].close / bars[i - 1].close - 1;
  return r <= ctx.params.drop ? 1 : 0;
}
