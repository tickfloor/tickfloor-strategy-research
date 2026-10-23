// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-36). Frozen before code.
export const meta = {
  id: "c1022-redteam-36",
  name: "Sector momentum, rank averaged over 3/6/12 months, top 3, own-trend gate to IEF",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "etf",
  timeframe: "1d",
  rebalance: "monthly",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "IEF"],
  params: { horizons: [63, 126, 252], top: 3, gate: 252, need: 254 },
};

export function rank(universe, t, ctx) {
  const { horizons, top, gate, need } = ctx.params;
  const syms = Object.keys(universe).sort();
  const ew = () => { const w = {}; for (const s of syms) w[s] = 1 / syms.length; return w; };
  const sectors = syms.filter((s) => s !== "IEF" && universe[s].length >= need);
  if (sectors.length < 6) return ew();

  const ret = (s, h) => { const b = universe[s], e = b.length - 1; return b[e].close / b[e - h].close - 1; };
  const score = {};
  for (const s of sectors) score[s] = 0;
  for (const h of horizons) {
    const byRet = sectors.slice().sort((a, b) => ret(a, h) - ret(b, h) || (a < b ? -1 : 1));
    byRet.forEach((s, i) => { score[s] += (i / (sectors.length - 1)) / horizons.length; });
  }
  const chosen = sectors.slice().sort((a, b) => score[b] - score[a] || (a < b ? -1 : 1)).slice(0, top);

  const w = {};
  for (const s of chosen) {
    const dest = ret(s, gate) <= 0 ? "IEF" : s;
    // ponytail: IEF has no bar on some dates; a gated weight with no IEF bar stays cash that rebalance.
    if (dest === "IEF" && universe.IEF === undefined) continue;
    w[dest] = (w[dest] || 0) + 1 / top;
  }
  return w;
}
