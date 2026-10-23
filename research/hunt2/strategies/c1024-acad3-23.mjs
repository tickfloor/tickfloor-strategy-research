// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-23). Atilgan, Bali, Demirtas & Gunaydin 2020, JFE 135(3), 725-753
export const meta = {
  id: "c1024-acad3-23",
  name: "Left-tail momentum: long the quintile with the smallest expected shortfall over the past year (Atilgan-Bali-Demirtas-Gunaydin)",
  family: "volatility",
  source: "c1024/acad3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 250, q: 0.05, bottomFrac: 0.2 },
};

// return at offset d back from the symbol's own last bar e = L-1
const retAt = (b, d) => b[b.length - 1 - d].close / b[b.length - 2 - d].close - 1;

export function rank(universe, t, ctx) {
  const { window: W, q, bottomFrac } = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= W + 1) continue; // eligible if L > 251
    const r = [];
    for (let d = 0; d < W; d++) r.push(retAt(b, d));
    r.sort((x, y) => x - y);
    const m = Math.floor(q * W); // 12 lowest of 250 returns
    let s = 0;
    for (let j = 0; j < m; j++) s += r[j];
    scored.push({ sym, es: -(s / m) });
  }
  const k = Math.floor(bottomFrac * scored.length);
  if (k < 3) return {};
  scored.sort((a, b) => a.es - b.es || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, k)) w[s.sym] = 1 / k;
  return w;
}
