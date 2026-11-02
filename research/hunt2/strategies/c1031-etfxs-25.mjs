// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-25)
export const meta = {
  id: "c1031-etfxs-25",
  name: "Dollar-neutral sector momentum: long the top 3, short the bottom 3 of 11 sectors by 12-1, monthly (Moskowitz-Grinblatt)",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  longShort: true,
  params: { top: 3, bottom: 3 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 253) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 8) return {};
  for (const s of elig) s.mom = s.b[s.e - 21].close / s.b[s.e - 252].close - 1;
  elig.sort((x, y) => y.mom - x.mom || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const s of elig.slice(0, p.top)) w[s.sym] = 1 / (p.top + p.bottom);
  for (const s of elig.slice(elig.length - p.bottom)) w[s.sym] = -1 / (p.top + p.bottom);
  return w;
}
