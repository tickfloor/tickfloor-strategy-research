// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-05). Bali & Cakici 2004, Financial Analysts Journal 60(2), 57-73
export const meta = {
  id: "c1024-acad3-05__rob1",
  name: "Value-at-risk premium: long the quintile with the largest 5% daily loss over the past year (Bali-Cakici) (-25%)",
  family: "volatility",
  source: "c1024/acad3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 188, q: 0.05, topFrac: 0.2 },
};

// return at offset d back from the symbol's own last bar e = L-1
const retAt = (b, d) => b[b.length - 1 - d].close / b[b.length - 2 - d].close - 1;

export function rank(universe, t, ctx) {
  const { window: W, q, topFrac } = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= W + 1) continue; // eligible if L > 251
    const r = [];
    for (let d = 0; d < W; d++) r.push(retAt(b, d));
    r.sort((x, y) => x - y);
    const lowIdx = Math.ceil(q * W) - 1; // 13th lowest of 250 returns
    scored.push({ sym, va: -r[lowIdx] });
  }
  const k = Math.floor(topFrac * scored.length);
  if (k < 3) return {};
  scored.sort((a, b) => b.va - a.va || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, k)) w[s.sym] = 1 / k;
  return w;
}
