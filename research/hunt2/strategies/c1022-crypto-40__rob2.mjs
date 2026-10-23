// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-40). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-40__rob2",
  name: "Momentum acceleration (recent momentum minus scaled longer momentum) (+25%)",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { short: 9, long: 35, top: 3 },
};

export function rank(universe, t, ctx) {
  const { short, long, top } = ctx.params;
  const scores = [];
  for (const k of Object.keys(universe)) {
    const b = universe[k];
    if (b.length <= long) continue;
    const n = b.length;
    const rS = b[n - 1].close / b[n - 1 - short].close - 1;
    const rL = b[n - 1].close / b[n - 1 - long].close - 1;
    scores.push([k, rS - rL / 4]);
  }
  const picks = scores.sort((a, b) => b[1] - a[1]).slice(0, top);
  if (!picks.length) return {};
  const w = {};
  for (const [k] of picks) w[k] = 1 / picks.length;
  return w;
}
