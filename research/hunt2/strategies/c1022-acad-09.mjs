// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-09). Asness, Moskowitz & Pedersen 2013, 'Value and momentum everywhere', Journal of Finance 68(3), 929-985; De Bondt & Thaler 1985 for the reversal leg
export const meta = {
  id: "c1022-acad-09",
  name: "Value-and-momentum combo in stocks (12-1 momentum + 24-month reversal skipping 12)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { momForm: 252, momSkip: 21, valueEnd: 252, valueStart: 756, topFrac: 0.2 },
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
    if (L <= p.valueStart + 1) continue;
    list.push({
      sym,
      mom: b[L - 1 - p.momSkip].close / b[L - 1 - p.momForm].close - 1,
      val: -(b[L - 1 - p.valueEnd].close / b[L - 1 - p.valueStart].close - 1),
    });
  }
  const E = list.length;
  const k = Math.floor(p.topFrac * E);
  if (k < 3) return {};
  const rm = pctRanks(list, "mom");
  const rv = pctRanks(list, "val");
  for (const x of list) x.score = 0.5 * rm.get(x.sym) + 0.5 * rv.get(x.sym);
  list.sort((a, b) => b.score - a.score || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of list.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
