// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-39). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-39",
  name: "Short-term volume surge with positive return (continuation)",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { vs: 5, vl: 60, ratio: 2.0, top: 3 },
};

export function rank(universe, t, ctx) {
  const { vs, vl, ratio, top } = ctx.params;
  const cands = [];
  for (const k of Object.keys(universe)) {
    const b = universe[k];
    if (b.length <= vl) continue;
    let v5 = 0;
    let v60 = 0;
    for (let j = b.length - vs; j < b.length; j++) v5 += b[j].volume;
    for (let j = b.length - vl; j < b.length; j++) v60 += b[j].volume;
    if (v60 <= 0) continue;
    const vr = (v5 / vs) / (v60 / vl);
    const r5 = b[b.length - 1].close / b[b.length - 1 - vs].close - 1;
    if (vr >= ratio && r5 > 0) cands.push([k, vr]);
  }
  const picks = cands.sort((a, b) => b[1] - a[1]).slice(0, top);
  if (!picks.length) return {};
  const w = {};
  for (const [k] of picks) w[k] = 1 / picks.length;
  return w;
}
