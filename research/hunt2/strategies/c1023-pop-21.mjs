// c1023 pop chunk 2. Bottom fishing: new 52-week closing low, fixed 60-bar hold (George & Hwang 2004 prior).
export const meta = {
  id: "c1023-pop-21",
  name: "Bottom fishing: buy a new 52-week closing low, hold 60 bars",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  holdBars: 60,
  params: { low: 250, holdBars: 60 },
};

// holdBars harness: a non-zero signal opens a trade held exactly 60 bars, so return 1 only on the entry bar.
export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.until === undefined) S.until = -1;
  if (i < p.low || i < S.until) return 0;
  let lo = Infinity;
  for (let k = i - p.low; k < i; k++) if (bars[k].close < lo) lo = bars[k].close;
  if (bars[i].close < lo) {
    S.until = i + p.holdBars;
    return 1;
  }
  return 0;
}
