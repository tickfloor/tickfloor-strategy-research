export const meta = {
  id: "c1022-acad-30",
  name: "Long-term reversal: buy the bottom quintile by 36-to-13-month-ago return (De Bondt-Thaler)",
  family: "mean_reversion",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { startBars: 756, endBars: 252, bottomFrac: 0.2 },
};

// lt = close[t-252] / close[t-756] - 1. Long the bottom bottomFrac by lt, equal weight; cash if fewer than 3 names.
export function rank(universe, t, ctx) {
  const { startBars, endBars, bottomFrac } = ctx.params;
  const rows = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= startBars + 1) continue;
    const L = b.length - 1;
    rows.push([s, b[L - endBars].close / b[L - startBars].close - 1]);
  }
  rows.sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : 1));
  const k = Math.floor(bottomFrac * rows.length);
  if (k < 3) return {};
  const w = {};
  for (const [s] of rows.slice(0, k)) w[s] = 1 / k;
  return w;
}
