// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-16). Antonacci 2014, 'Dual Momentum Investing' (McGraw-Hill), ch. 8; Miffre & Rallis 2007, 'Momentum strategies in commodity futures markets', JBF 31(6)
export const meta = {
  id: "c1022-acad-16",
  name: "Commodity dual momentum: top 2 of GLD/SLV/USO/DBC/UNG by 12-month return, else SHY (Antonacci)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["GLD", "SLV", "USO", "DBC", "UNG", "SHY"],
  rebalance: "monthly",
  params: { lookback: 252, topN: 2 },
};

const COMMODITIES = ["GLD", "SLV", "USO", "DBC", "UNG"];

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = (sym) => universe[sym] !== undefined && universe[sym].length > p.lookback + 1;
  const r12 = (sym) => {
    const b = universe[sym];
    return b[b.length - 1].close / b[b.length - 1 - p.lookback].close - 1;
  };
  const hurdle = elig("SHY") ? r12("SHY") : 0;
  const coms = COMMODITIES.filter(elig).sort((x, y) => r12(y) - r12(x) || (x < y ? -1 : 1));
  const w = {};
  for (let s = 0; s < p.topN; s++) {
    const c = coms[s];
    if (c !== undefined && r12(c) > hurdle) w[c] = (w[c] || 0) + 1 / p.topN;
    else if (elig("SHY")) w.SHY = (w.SHY || 0) + 1 / p.topN;
  }
  return w;
}
