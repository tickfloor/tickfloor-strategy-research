// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-11). Grossman & Zhou (1993) Mathematical Finance 3(3)
export const meta = {
  id: "c1031-overlay-11",
  name: "Grossman-Zhou drawdown control on 18 crypto coins: exposure = 1 - drawdown/60% from the 365-day closing high, weekly",
  family: "drawdown-control",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  warmup: 370,
  params: { peakWin: 365, alpha: 0.6, need: 365 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    let peak = -Infinity;
    for (let k = e - p.peakWin + 1; k <= e; k++) peak = Math.max(peak, b[k].close);
    const dd = 1 - b[e].close / peak;
    w[s] = Math.max(0, 1 - dd / p.alpha) / N;
  }
  return w;
}
