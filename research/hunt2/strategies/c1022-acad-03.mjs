// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-03). Jegadeesh & Titman 1993, 'Returns to buying winners and selling losers', Journal of Finance 48(1), 65-91
export const meta = {
  id: "c1022-acad-03",
  name: "Jegadeesh-Titman 6/6 overlapping momentum (six monthly cohorts, 1-week skip)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { formBars: 126, skipBars: 5, holdMonths: 6, topFrac: 0.2, monthBars: 21 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    if (universe[sym].length > 260) names.push({ sym, b: universe[sym] });
  }
  const E = names.length;
  const Nk = Math.floor(p.topFrac * E);
  const w = {};
  if (Nk < 3) return w;
  for (let k = 0; k < p.holdMonths; k++) {
    const scored = names.map((n) => {
      const idx = n.b.length - 1 - p.monthBars * k;
      return { sym: n.sym, ret: n.b[idx - p.skipBars].close / n.b[idx - p.formBars].close - 1 };
    });
    scored.sort((a, b) => b.ret - a.ret || (a.sym < b.sym ? -1 : 1));
    for (const s of scored.slice(0, Nk)) w[s.sym] = (w[s.sym] || 0) + (1 / p.holdMonths) * (1 / Nk);
  }
  return w;
}
