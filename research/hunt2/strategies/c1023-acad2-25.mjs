// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-25). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-25",
  name: "Crypto high idiosyncratic volatility: long the 6 coins with the highest residual volatility to the crypto market, weekly (Zhang-Li)",
  family: "volatility",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 154,
  params: { window: 30, topN: 6 },
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
  const { window, topN } = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 35);
  if (syms.length < 3) return {};
  const m = ewMarket(universe, 35, window);
  let mx = 0;
  for (const x of m) mx += x;
  mx /= window;
  let sxx = 0;
  for (const x of m) sxx += (x - mx) * (x - mx);
  if (!(sxx > 0)) return {};
  const scores = [];
  for (const sym of syms) {
    const b = universe[sym];
    const y = [];
    for (let k = 0; k < window; k++) y.push(retAt(b, k));
    let my = 0;
    for (const x of y) my += x;
    my /= window;
    let sxy = 0;
    for (let k = 0; k < window; k++) sxy += (m[k] - mx) * (y[k] - my);
    const beta = sxy / sxx;
    const alpha = my - beta * mx;
    const e = [];
    for (let k = 0; k < window; k++) e.push(y[k] - alpha - beta * m[k]);
    let em = 0;
    for (const x of e) em += x;
    em /= window;
    let ss = 0;
    for (const x of e) ss += (x - em) * (x - em);
    scores.push([sym, Math.sqrt(ss / (window - 1))]); // sample std of residuals
  }
  return pickTop(scores, topN, true);
}
