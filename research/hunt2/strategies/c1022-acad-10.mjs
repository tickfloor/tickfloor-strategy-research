// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-10). Blitz & van Vliet 2018, 'The conservative formula: quantitative investing made easy', Journal of Portfolio Management 44(7), 24-38
export const meta = {
  id: "c1022-acad-10",
  name: "Conservative formula, price-only: low 3-year volatility then high 12-1 momentum (Blitz-van Vliet)",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { volBars: 756, lowVolFrac: 0.5, momForm: 252, momSkip: 21, topFrac: 0.2 },
};

function lastReturns(b, n) {
  const out = [];
  for (let i = b.length - n; i < b.length; i++) out.push(b[i].close / b[i - 1].close - 1);
  return out;
}

function stdDev(a) {
  const m = a.reduce((s, x) => s + x, 0) / a.length;
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length);
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const list = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= p.volBars + 1) continue;
    list.push({
      sym,
      vol: stdDev(lastReturns(b, p.volBars)),
      mom: b[L - 1 - p.momSkip].close / b[L - 1 - p.momForm].close - 1,
    });
  }
  const E = list.length;
  if (E < 3) return {};
  list.sort((a, b) => a.vol - b.vol || (a.sym < b.sym ? -1 : 1));
  const H = list.slice(0, Math.floor(p.lowVolFrac * E));
  H.sort((a, b) => b.mom - a.mom || (a.sym < b.sym ? -1 : 1));
  const m = Math.min(Math.floor(p.topFrac * E), H.length);
  if (m < 3) return {};
  const w = {};
  for (const x of H.slice(0, m)) w[x.sym] = 1 / m;
  return w;
}
