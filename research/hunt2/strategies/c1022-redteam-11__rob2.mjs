// c1022 red-team spec 11: crypto momentum with the most recent week skipped (28-7).
// Source: Jegadeesh & Titman 1993 (12-1 skip); Liu & Tsyvinski 2021 RFS.
export const meta = {
  id: "c1022-redteam-11__rob2",
  name: "Crypto momentum with the most recent week skipped (28-7) (+25%)",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { lookback: 35, skip: 7, need: 37, minNames: 8, frac: 0.3 },
};

const cmpName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { lookback, skip, need, minNames, frac } = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    const e = b.length - 1;
    scored.push([sym, b[e - skip].close / b[e - lookback].close - 1]);
  }
  const n = scored.length;
  if (n < minNames) return ew(universe);

  const K = Math.max(3, Math.round(frac * n));
  scored.sort((a, b) => b[1] - a[1] || cmpName(a[0], b[0]));
  const w = {};
  for (const [sym] of scored.slice(0, K)) w[sym] = 1 / K;
  return w;
}
