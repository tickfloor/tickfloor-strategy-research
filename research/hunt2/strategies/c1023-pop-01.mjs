// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-01). Larry Williams, Long-Term Secrets to Short-Term Trading (1999), 'Oops!'.
export const meta = {
  id: "c1023-pop-01",
  name: "Larry Williams 'Oops!' gap-down reversal, 2-day hold",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  holdBars: 2,
  params: { holdBars: 2, minGapPct: 0 },
};

// Oops bar: open below yesterday's low and close back above it. holdBars handles the exit.
export function signal(bars, i, ctx) {
  if (i < 1) return 0;
  const pl = bars[i - 1].low;
  return bars[i].open < pl * (1 - ctx.params.minGapPct) && bars[i].close > pl ? 1 : 0;
}
