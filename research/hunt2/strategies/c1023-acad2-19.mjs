// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-19). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-19",
  name: "Crypto intermediate-horizon reversal: long the 6 worst coins by their week-2-to-week-8 return, weekly (Jia-Goodell-Shen)",
  family: "mean_reversion",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 179,
  params: { skip: 7, form: 56, bottomN: 6 },
};

// Sort by score (desc or asc, symbol order breaks ties), equal-weight the first k; cash if fewer than 3.
function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { skip, form, bottomN } = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 60) continue;
    scores.push([sym, b[L - 1 - skip].close / b[L - 1 - form].close - 1]);
  }
  return pickTop(scores, bottomN, false);
}
