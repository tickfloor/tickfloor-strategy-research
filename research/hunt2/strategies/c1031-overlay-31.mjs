// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-31), frozen before code.
export const meta = {
  id: "c1031-overlay-31",
  name: "MAX-effect trim: a large cap is held at half weight for as long as its largest daily gain in the last 21 days exceeds 7%, weekly",
  family: "volatility",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  params: { win: 21, maxGain: 0.07, trimTo: 0.5, need: 22 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    let mx = -Infinity;
    for (let k = e - p.win + 1; k <= e; k++) mx = Math.max(mx, b[k].close / b[k - 1].close - 1);
    w[s] = (mx > p.maxGain ? p.trimTo : 1) / N;
  }
  return w;
}
