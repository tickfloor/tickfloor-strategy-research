// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-33), frozen before code.
export const meta = {
  id: "c1031-overlay-33",
  name: "Bitcoin volatility-percentile gate: all coins to cash while BTC's 30-day volatility is in the top quintile of its trailing two years",
  family: "volatility",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { sigmaWin: 30, histBars: 730, zeroPct: 0.8, need: 2 },
};

const sd = (xs) => {
  const n = xs.length;
  const m = xs.reduce((a, v) => a + v, 0) / n;
  let ss = 0;
  for (const v of xs) ss += (v - m) * (v - m);
  return Math.sqrt(ss / (n - 1));
};

// True when BTC's latest rolling vol is at or above zeroPct of its trailing histBars values.
const gateOn = (a, p) => {
  const r = new Array(a.length).fill(NaN);
  for (let k = 1; k < a.length; k++) r[k] = a[k].close / a[k - 1].close - 1;
  const ba = a.length - 1;
  const sigAt = (k) => sd(r.slice(k - p.sigmaWin + 1, k + 1));
  const sigB = sigAt(ba);
  let le = 0;
  for (let k = ba - p.histBars + 1; k <= ba; k++) if (sigAt(k) <= sigB) le++;
  return le / p.histBars >= p.zeroPct;
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  const a = universe.BTCUSDT;
  const minBars = p.histBars + p.sigmaWin + 1;
  const x = !a || a.length < minBars ? 1 : gateOn(a, p) ? 0 : 1;
  const w = {};
  for (const s of syms) w[s] = x / N;
  return w;
}
