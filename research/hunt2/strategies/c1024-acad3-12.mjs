// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-12). Lemperiere et al. 2017, Quantitative Finance 17(1), 1-14
export const meta = {
  id: "c1024-acad3-12",
  name: "Cross-asset skewness premium: hold the 8 of 25 asset-class ETFs with the most negative one-year daily skewness, monthly (Lemperiere et al.)",
  family: "volatility",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { window: 252, top: 8 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 253) continue;
    const r = [];
    for (let k = L - p.window; k <= L - 1; k++) r.push(b[k].close / b[k - 1].close - 1);
    const n = r.length;
    const mu = r.reduce((a, x) => a + x, 0) / n;
    let m2 = 0, m3 = 0;
    for (const x of r) { const d = x - mu; m2 += d * d; m3 += d * d * d; }
    const sd = Math.sqrt(m2 / (n - 1));
    if (!(sd > 0)) continue;
    names.push({ sym, skew: m3 / n / (sd * sd * sd) });
  }
  const E = names.length;
  if (E < 3) return {};
  const picks = Math.min(p.top, E);
  names.sort((a, b) => a.skew - b.skew || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of names.slice(0, picks)) w[x.sym] = 1 / p.top; // spec: 1/top each (cash for missing slots)
  return w;
}
