// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-16). Low nominal-price crypto basket, weekly
export const meta = {
  id: "c1031-acad4-16",
  name: "Low nominal price crypto basket: long the 6 cheapest coins, weekly",
  family: "other",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { top: 6 },
};

export function rank(universe, t, ctx) {
  const k = ctx.params.top;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < 2) continue;
    names.push({ sym, price: b[b.length - 1].close });
  }
  if (names.length < k) return {};
  names.sort((x, y) => x.price - y.price || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const n of names.slice(0, k)) w[n.sym] = 1 / k;
  return w;
}
