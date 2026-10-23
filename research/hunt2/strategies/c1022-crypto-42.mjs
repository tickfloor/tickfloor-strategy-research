// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-42). Portfolio rank mode, monthly.

export const meta = {
  id: "c1022-crypto-42",
  name: "Negative-skewness premium: avoid positively skewed (lottery-like) coins",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { win: 90, n: 5 },
};

// sample (adjusted Fisher-Pearson) skewness of the last win daily returns
function sampleSkew(b, win) {
  const r = [];
  for (let j = b.length - win; j < b.length; j++) r.push(b[j].close / b[j - 1].close - 1);
  const m = r.reduce((a, x) => a + x, 0) / win;
  let m2 = 0;
  let m3 = 0;
  for (const x of r) { m2 += (x - m) ** 2; m3 += (x - m) ** 3; }
  m2 /= win;
  m3 /= win;
  if (!(m2 > 0)) return NaN;
  const g1 = m3 / m2 ** 1.5;
  return (Math.sqrt(win * (win - 1)) / (win - 2)) * g1;
}

export function rank(universe, t, ctx) {
  const { win, n } = ctx.params;
  const scores = [];
  for (const k of Object.keys(universe)) {
    const b = universe[k];
    if (b.length <= win) continue;
    const sk = sampleSkew(b, win);
    if (!Number.isNaN(sk)) scores.push([k, sk]);
  }
  const picks = scores.sort((a, b) => a[1] - b[1]).slice(0, n);
  if (!picks.length) return {};
  const w = {};
  for (const [k] of picks) w[k] = 1 / picks.length;
  return w;
}
