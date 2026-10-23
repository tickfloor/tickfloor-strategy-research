// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-02). Larry Williams, Long-Term Secrets to Short-Term Trading (1999), 'Smash Day Patterns'.
export const meta = {
  id: "c1023-pop-02",
  name: "Larry Williams bearish 'Smash Day' reversal buy, 3-day hold",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  holdBars: 3,
  params: { holdBars: 3 },
};

// Smash day j = i-1 closes below the low of j-1. Trigger at i closes above the high of j.
export function signal(bars, i) {
  if (i < 2) return 0;
  const j = i - 1;
  const smash = bars[j].close < bars[j - 1].low;
  return smash && bars[i].close > bars[j].high ? 1 : 0;
}
