// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-32), frozen before code.
export const meta = {
  id: "c1031-overlay-32",
  name: "Trend-persistence exposure on crypto: weight = share of the last 20 days a coin closed above its own 50-day average, weekly",
  family: "trend",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { smaWin: 50, persistBars: 20, need: 70 },
};

// Share of the last persistBars days on which the close was above its own smaWin-day average.
const exposure = (b, p) => {
  const e = b.length - 1;
  let count = 0;
  for (let j = e - p.persistBars + 1; j <= e; j++) {
    let sum = 0;
    for (let k = j - p.smaWin + 1; k <= j; k++) sum += b[k].close;
    if (b[j].close > sum / p.smaWin) count++;
  }
  return count / p.persistBars;
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  const w = {};
  for (const s of syms) w[s] = exposure(universe[s], p) / N;
  return w;
}
