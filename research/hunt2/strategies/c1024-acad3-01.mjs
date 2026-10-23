// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-01). Amaya, Christoffersen, Jacobs & Vasquez 2015, JFE 118(1), 135-167
export const meta = {
  id: "c1024-acad3-01",
  name: "Realized kurtosis: long the quintile with the fattest-tailed daily returns over the past 3 months (Amaya-Christoffersen-Jacobs-Vasquez)",
  family: "volatility",
  source: "c1024/acad3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { window: 63, topFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 64) continue;
    const e = L - 1;
    const r = [];
    for (let k = e - p.window + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    const n = r.length;
    const mu = r.reduce((a, x) => a + x, 0) / n;
    let m2 = 0, m4 = 0;
    for (const x of r) { const d = x - mu; m2 += d * d; m4 += d * d * d * d; }
    m2 /= n;
    m4 /= n;
    if (!(m2 > 0)) continue;
    names.push({ sym, kurt: m4 / (m2 * m2) });
  }
  const k = Math.floor(p.topFrac * names.length);
  if (k < 3) return {};
  names.sort((a, b) => b.kurt - a.kurt || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of names.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
