// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-24)
export const meta = {
  id: "c1031-etfxs-24",
  name: "Skip-week quarterly momentum, weekly rebalance: top 4 of 13 equity ETFs by the 13-week return ending one week ago",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "QQQ", "DIA"],
  rebalance: "weekly",
  longShort: false,
  params: { lookback: 65, skip: 5, top: 4 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 70) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 8) return {};
  for (const s of elig) s.score = s.b[s.e - p.skip].close / s.b[s.e - p.lookback].close - 1;
  elig.sort((x, y) => y.score - x.score || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const s of elig.slice(0, p.top)) w[s.sym] = 1 / p.top;
  return w;
}
