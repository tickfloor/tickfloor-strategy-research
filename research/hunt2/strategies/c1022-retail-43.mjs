// c1022 retail spec 43 (campaign-1022/prereg-retail.json, frozen before code).
// Grid-bot exposure: g = clamp(0.5 + (SMA50 - close)/(0.20*SMA50), 0, 1), weight = g / N.
export const meta = {
  id: "c1022-retail-43",
  name: "Grid-bot exposure around the 50-day SMA (Pionex/3Commas style)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { center: 50, halfRange: 0.1 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.center);
  const N = syms.length;
  if (N === 0) return {};
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const n = b.length;
    let sum = 0;
    for (let k = n - p.center; k < n; k++) sum += b[k].close;
    const c = sum / p.center;
    const close = b[n - 1].close;
    const g = Math.min(1, Math.max(0, 0.5 + (c - close) / (2 * p.halfRange * c)));
    if (g > 0) w[s] = g / N;
  }
  return w;
}
