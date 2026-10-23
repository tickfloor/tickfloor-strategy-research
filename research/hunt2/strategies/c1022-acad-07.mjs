// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-07). Bhootra & Hur 2013, 'The timing of 52-week high price and momentum', Journal of Banking & Finance 37(10), 3773-3782
export const meta = {
  id: "c1022-acad-07",
  name: "Recency of the 52-week high: near the high AND the high was set recently (Bhootra-Hur)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 252, nearFrac: 0.5, topFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 253) continue;
    let hi = -Infinity;
    let at = L - 1;
    for (let i = L - p.window; i <= L - 1; i++) {
      if (b[i].high >= hi) {
        hi = b[i].high;
        at = i;
      }
    }
    names.push({ sym, near: b[L - 1].close / hi, since: L - 1 - at });
  }
  const E = names.length;
  const m = Math.floor(p.topFrac * E);
  names.sort((a, b) => b.near - a.near || (a.sym < b.sym ? -1 : 1));
  const F = names.slice(0, Math.floor(p.nearFrac * E));
  F.sort((a, b) => a.since - b.since || (a.sym < b.sym ? -1 : 1));
  const chosen = F.slice(0, Math.min(m, F.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const x of chosen) w[x.sym] = 1 / chosen.length;
  return w;
}
