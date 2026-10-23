// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-04). Chen, Kadan & Kose 2009, 'Fresh momentum', working paper (Washington University in St. Louis), SSRN 1374057
export const meta = {
  id: "c1022-acad-04",
  name: "Fresh momentum: recent winners whose prior six months were losers (Chen-Kadan-Kose)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { recentBars: 126, skip: 21, priorStart: 252, topFrac: 0.3 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= p.priorStart + 1) continue;
    names.push({
      sym,
      recent: b[L - 1 - p.skip].close / b[L - 1 - p.recentBars].close - 1,
      prior: b[L - 1 - p.recentBars].close / b[L - 1 - p.priorStart].close - 1,
    });
  }
  names.sort((a, b) => b.recent - a.recent || (a.sym < b.sym ? -1 : 1));
  const U = names.slice(0, Math.floor(p.topFrac * names.length));
  const N = Math.floor(U.length / 2);
  if (N < 3) return {};
  U.sort((a, b) => a.prior - b.prior || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of U.slice(0, N)) w[x.sym] = 1 / N;
  return w;
}
