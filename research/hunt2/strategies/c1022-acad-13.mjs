// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-13). Baker, Bradley & Wurgler 2011, 'Benchmarks as limits to arbitrage: understanding the low-volatility anomaly', Financial Analysts Journal 67(1), 40-54
export const meta = {
  id: "c1022-acad-13",
  name: "Sector ETF low volatility: hold the 3 least volatile of 11 sectors, monthly",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  params: { volBars: 60, topN: 3 },
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
    if (b.length <= p.volBars + 1) continue;
    list.push({ sym, vol: stdDev(lastReturns(b, p.volBars)) });
  }
  if (list.length < p.topN) return {};
  list.sort((a, b) => a.vol - b.vol || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of list.slice(0, p.topN)) w[x.sym] = 1 / p.topN;
  return w;
}
