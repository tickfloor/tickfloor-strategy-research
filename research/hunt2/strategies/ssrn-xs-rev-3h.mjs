// SSRN run 6. Rank the 8 CRYPTO_1H pairs by return over the prior h hours; hold the bottom 2 equal weight (long-only) for the next h hours.
// Needs a portfolio mode on 1h bars. The harness only runs rank() strategies on daily bars, so this file stays unrun if the 1h smoke check fails (see the prereg).
export const meta = {
  id: "ssrn-xs-rev-3h",
  name: "Hourly cross-sectional reversal, bottom 2 by prior 3h return, long-only (CRYPTO_1H)",
  family: "mean_reversion",
  source: "Herberger et al. via SSRN top-20 #19; prereg research/prereg-2026-10-07-ssrn.md run 6",
  assetClass: "crypto",
  timeframe: "1h",
  universe: "CRYPTO_1H",
  rebalance: "daily",
  params: { h: 3, pick: 2 },
};

export function rank(universe, t, ctx) {
  const { h, pick } = ctx.params;
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < h + 1) continue;
    rows.push([sym, b[b.length - 1].close / b[b.length - 1 - h].close - 1]);
  }
  if (rows.length < pick * 2) return {};
  rows.sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : 1));
  const w = {};
  for (const [sym] of rows.slice(0, pick)) w[sym] = 1 / pick;
  return w;
}
