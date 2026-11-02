// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-21). Source: Han, Yang & Zhou 2013, 'A new anomaly: the cross-sectional profitability of technical anal
export const meta = {
  id: "c1031-acad4-21",
  name: "Technical analysis pays in high-volatility stocks: buy the top-volatility fifth that closes above its 20-day average, weekly (Han-Yang-Zhou)",
  family: "trend",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  longShort: false,
  params: { volWin: 63, maLen: 20, topFrac: 0.2 },
};

function mean(a) { let s = 0; for (const x of a) s += x; return s / a.length; }

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < 64) continue;
    const r = [];
    for (let k = L - p.volWin; k <= L - 1; k++) r.push(b[k].close / b[k - 1].close - 1);
    const m = mean(r);
    let ss = 0;
    for (const x of r) ss += (x - m) ** 2;
    names.push({ sym, b, vol: Math.sqrt(ss / (r.length - 1)) });
  }
  const k = Math.floor(p.topFrac * names.length);
  if (k < 3) return {};
  names.sort((x, y) => y.vol - x.vol || (x.sym < y.sym ? -1 : 1));
  const kept = names.slice(0, k).filter((n) => {
    const L = n.b.length;
    const ma = mean(n.b.slice(L - p.maLen).map((c) => c.close));
    return n.b[L - 1].close > ma;
  });
  if (kept.length < 3) return {};
  const w = {};
  for (const n of kept) w[n.sym] = 1 / kept.length;
  return w;
}
