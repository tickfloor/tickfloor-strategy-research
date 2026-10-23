// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-07). Death cross bought as a contrarian entry (financial-media claim that it marks lows).
export const meta = {
  id: "c1023-pop-07",
  name: "Death cross as a contrarian buy: long the day the 50-day crosses below the 200-day, hold 60 bars",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  holdBars: 60,
  params: { fast: 50, slow: 200, holdBars: 60 },
};

// Death cross on bar i: fast SMA moves from >= slow SMA to below it. holdBars handles the exit.
export function signal(bars, i, ctx) {
  if (i < 1) return 0;
  const p = ctx.params;
  const f = ctx.sma("close", p.fast, i), s = ctx.sma("close", p.slow, i);
  const fPrev = ctx.sma("close", p.fast, i - 1), sPrev = ctx.sma("close", p.slow, i - 1);
  return f < s && fPrev >= sPrev ? 1 : 0;
}
