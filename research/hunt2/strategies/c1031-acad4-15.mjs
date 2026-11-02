// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-15). Bali & Cakici 2004, Financial Analysts Journal 60(2), 57-73
export const meta = {
  id: "c1031-acad4-15",
  name: "Crypto value-at-risk premium: long the 6 coins with the largest 5% daily-loss size over 90 days, weekly (Bali-Cakici transfer)",
  family: "volatility",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 90, q: 0.05, top: 6 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < p.window + 2) continue;
    const x = [];
    for (let k = e - p.window + 1; k <= e; k++) x.push(b[k].close / b[k - 1].close - 1);
    x.sort((u, v) => u - v);
    scored.push([sym, -x[Math.floor(p.q * p.window)]]);
  }
  if (scored.length < p.top) return {};
  scored.sort((u, v) => v[1] - u[1] || (u[0] < v[0] ? -1 : u[0] > v[0] ? 1 : 0));
  const w = {};
  for (const [sym] of scored.slice(0, p.top)) w[sym] = 1 / p.top;
  return w;
}
