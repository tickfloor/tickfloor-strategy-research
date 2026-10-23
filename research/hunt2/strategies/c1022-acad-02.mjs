// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-02). Cooper, Gutierrez & Hameed 2004, 'Market states and momentum', Journal of Finance 59(3), 1345-1365
export const meta = {
  id: "c1022-acad-02",
  name: "Market-state momentum: 12-1 momentum only after a positive 24-month market (Cooper-Gutierrez-Hameed)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 252, skip: 21, topFrac: 0.2, stateLookback: 504 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 505) continue;
    names.push({ sym, b, mom: b[L - 1 - p.skip].close / b[L - 1 - p.form].close - 1 });
  }
  const E = names.length;
  const k = Math.floor(p.topFrac * E);
  if (k < 3) return {};
  const ew = (d) => names.reduce((s, n) => s + n.b[n.b.length - 1 - d].close / n.b[n.b.length - 2 - d].close - 1, 0) / E;
  let growth = 1;
  for (let d = 0; d < p.stateLookback; d++) growth *= 1 + ew(d);
  if (!(growth - 1 > 0)) return {};
  names.sort((a, b) => b.mom - a.mom || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const n of names.slice(0, k)) w[n.sym] = 1 / k;
  return w;
}
