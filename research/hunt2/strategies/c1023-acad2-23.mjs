// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-23). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-23",
  name: "Crypto intermediate momentum echo: long the top 6 by the week-5-to-week-12 return, weekly (Novy-Marx transfer)",
  family: "momentum",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 209,
  params: { skip: 28, form: 84, topN: 6 },
};

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { skip, form, topN } = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 90) continue;
    scores.push([sym, b[L - 1 - skip].close / b[L - 1 - form].close - 1]);
  }
  return pickTop(scores, topN, true);
}
