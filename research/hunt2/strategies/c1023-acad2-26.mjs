// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-26). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-26",
  name: "Crypto salience: long the 6 coins with the lowest salience-weighted past-3-week return, weekly (Cosemans-Frehen transfer)",
  family: "other",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 144,
  params: { window: 21, theta: 0.1, delta: 0.7, bottomN: 6 },
};

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

function retAt(b, k) {
  const L = b.length;
  return b[L - 1 - k].close / b[L - 2 - k].close - 1;
}

function ewMarket(universe, minLen, n) {
  const syms = Object.keys(universe).filter((s) => universe[s].length > minLen);
  const m = [];
  for (let k = 0; k < n; k++) {
    let sum = 0;
    for (const sym of syms) sum += retAt(universe[sym], k);
    m.push(sum / syms.length);
  }
  return m;
}

export function rank(universe, t, ctx) {
  const { window, theta, delta, bottomN } = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 25);
  if (syms.length < 3) return {};
  const m = ewMarket(universe, 25, window); // rbar_d for offsets 0..window-1 (k = 0 is day t)
  let S = 0;
  for (let j = 1; j <= window; j++) S += Math.pow(delta, j);
  const scores = [];
  for (const sym of syms) {
    const b = universe[sym];
    const r = [];
    for (let k = 0; k < window; k++) r.push(retAt(b, k));
    const sal = [];
    for (let k = 0; k < window; k++) sal.push(Math.abs(r[k] - m[k]) / (Math.abs(r[k]) + Math.abs(m[k]) + theta));
    // rank the days by salience, most salient first (ties: earlier offset first)
    const order = Array.from({ length: window }, (_, k) => k).sort((a, c) => sal[c] - sal[a] || a - c);
    let st = 0;
    for (let p = 1; p <= window; p++) {
      const k = order[p - 1];
      const omega = Math.pow(delta, p) / S;
      st += (omega - 1 / window) * r[k];
    }
    scores.push([sym, st]);
  }
  return pickTop(scores, bottomN, false);
}
