// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-24). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-24",
  name: "Crypto downside beta: long the 6 coins with the highest beta to the crypto market on its down days, weekly (Zhang-Li-Xiong-Wang)",
  family: "volatility",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 303,
  params: { window: 180, topN: 6 },
};

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

// simple daily return of the coin at offset k back from its last bar (k = 0 is day t)
function retAt(b, k) {
  const L = b.length;
  return b[L - 1 - k].close / b[L - 2 - k].close - 1;
}

// EW crypto market: mean daily return of every coin with more than minLen bars, for offsets 0..n-1
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
  const { window, topN } = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 185);
  if (syms.length < 3) return {};
  const m = ewMarket(universe, 185, window);
  let mMean = 0;
  for (const x of m) mMean += x;
  mMean /= window;
  const D = []; // days (offsets) where the market is below its window mean
  for (let k = 0; k < window; k++) if (m[k] < mMean) D.push(k);
  if (D.length < 40) return {};
  let mx = 0;
  for (const k of D) mx += m[k];
  mx /= D.length;
  let den = 0;
  for (const k of D) den += (m[k] - mx) * (m[k] - mx);
  if (!(den > 0)) return {};
  const scores = [];
  for (const sym of syms) {
    const b = universe[sym];
    let my = 0;
    for (const k of D) my += retAt(b, k);
    my /= D.length;
    let num = 0;
    for (const k of D) num += (m[k] - mx) * (retAt(b, k) - my);
    scores.push([sym, num / den]); // cov(r, m | D) / var(m | D)
  }
  return pickTop(scores, topN, true);
}
