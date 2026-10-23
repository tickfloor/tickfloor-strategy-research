// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-15). Antonacci 2014, 'Dual Momentum Investing' (McGraw-Hill), ch. 8; Antonacci 2013, 'Absolute momentum: a simple rule-based strategy and universal trend-following overlay', SSRN 2244633
export const meta = {
  id: "c1022-acad-15",
  name: "Sector dual momentum: top 3 sectors by 12-month return, each held only if it beats SHY (Antonacci)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "AGG", "SHY"],
  rebalance: "monthly",
  params: { lookback: 252, topN: 3 },
};

const SECTORS = ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"];

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = (sym) => universe[sym] !== undefined && universe[sym].length > p.lookback + 1;
  const r12 = (sym) => {
    const b = universe[sym];
    return b[b.length - 1].close / b[b.length - 1 - p.lookback].close - 1;
  };
  const sectors = SECTORS.filter(elig).sort((x, y) => r12(y) - r12(x) || (x < y ? -1 : 1));
  const hurdle = elig("SHY") ? r12("SHY") : 0;
  const w = {};
  let aggSlots = 0;
  for (let s = 0; s < p.topN; s++) {
    const sec = sectors[s];
    if (sec !== undefined && r12(sec) > hurdle) w[sec] = (w[sec] || 0) + 1 / p.topN;
    else aggSlots += 1 / p.topN;
  }
  if (aggSlots > 0 && elig("AGG")) w.AGG = aggSlots;
  return w;
}
