// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-32). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-32",
  name: "Crypto low volatility-of-volatility: long the 6 coins whose rolling 7-day volatility was most stable over 60 days, weekly (Baltussen-van Bekkum-van der Grient transfer)",
  family: "volatility",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 189,
  params: { volBars: 7, window: 60, bottomN: 6 },
};

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

function sampleStd(xs) {
  const n = xs.length;
  let mu = 0;
  for (const x of xs) mu += x;
  mu /= n;
  let ss = 0;
  for (const x of xs) ss += (x - mu) * (x - mu);
  return Math.sqrt(ss / (n - 1));
}

export function rank(universe, t, ctx) {
  const { volBars, window, bottomN } = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 70) continue;
    // v_d = sample std of the volBars daily returns ending on day d, for the last `window` days
    const vs = [];
    for (let k = 0; k < window; k++) {
      const end = L - 1 - k;
      const rs = [];
      for (let j = end - volBars + 1; j <= end; j++) rs.push(b[j].close / b[j - 1].close - 1);
      vs.push(sampleStd(rs));
    }
    let mu = 0;
    for (const x of vs) mu += x;
    mu /= vs.length;
    if (!(mu > 0)) continue;
    scores.push([sym, sampleStd(vs) / mu]); // coefficient of variation of the rolling vol
  }
  return pickTop(scores, bottomN, false);
}
