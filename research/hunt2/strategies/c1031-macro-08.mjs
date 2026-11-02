export const meta = {
  id: "c1031-macro-08",
  name: "VIX-curve dispatch on sectors: momentum while the curve is in contango, short-term reversal when it is inverted, weekly",
  family: "momentum",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "VNQ"],
  rebalance: "weekly",
  params: { momLookback: 63, revLookback: 5, n: 3 },
};

// Rank mode: ctx.macro(id) is known by the rebalance day; no look-back is needed here.
export function rank(universe, t, ctx) {
  const p = ctx.params;
  const vix = ctx.macro("VIX");
  const vix3m = ctx.macro("VIX3M");
  if (vix === null || vix3m === null) return {};
  const calm = vix / vix3m < 1.0;
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < p.momLookback + 1) continue;
    rows.push({
      sym,
      mom: b[L - 1].close / b[L - 1 - p.momLookback].close - 1,
      rev: b[L - 1].close / b[L - 1 - p.revLookback].close - 1,
    });
  }
  const bySym = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);
  rows.sort((x, y) => (calm ? y.mom - x.mom : x.rev - y.rev) || bySym(x, y));
  const w = {};
  for (const r of rows.slice(0, p.n)) w[r.sym] = 1 / p.n;
  return w;
}
