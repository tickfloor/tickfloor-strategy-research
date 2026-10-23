// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-08). Asness, Moskowitz & Pedersen 2013, 'Value and momentum everywhere', Journal of Finance 68(3), 929-985
export const meta = {
  id: "c1022-acad-08",
  name: "Value-and-momentum combo across asset-class ETFs (Asness-Moskowitz-Pedersen 'everywhere')",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  params: { momForm: 252, momSkip: 21, valueBars: 756, topN: 6 },
};

function pctRanks(list, key) {
  const s = [...list].sort((a, b) => a[key] - b[key] || (a.sym < b.sym ? -1 : 1));
  const N = s.length;
  const out = new Map();
  s.forEach((x, i) => out.set(x.sym, N > 1 ? i / (N - 1) : 0.5));
  return out;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const list = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= p.valueBars + 1) continue;
    list.push({
      sym,
      mom: b[L - 1 - p.momSkip].close / b[L - 1 - p.momForm].close - 1,
      val: -(b[L - 1].close / b[L - 1 - p.valueBars].close - 1),
    });
  }
  if (!list.length) return {};
  const rm = pctRanks(list, "mom");
  const rv = pctRanks(list, "val");
  for (const x of list) x.score = 0.5 * rm.get(x.sym) + 0.5 * rv.get(x.sym);
  list.sort((a, b) => b.score - a.score || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of list.slice(0, Math.min(p.topN, list.length))) w[x.sym] = 1 / p.topN;
  return w;
}
