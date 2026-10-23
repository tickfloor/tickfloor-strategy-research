// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-58). Frozen before code.
export const meta = {
  id: "c1022-redteam-58",
  name: "Monthly 200-day SMA check: hold each coin above its 200-day average, checked only at month-end",
  family: "trend",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { sma: 200, need: 202 },
};

export function rank(universe, t, ctx) {
  const { sma, need } = ctx.params;
  const syms = Object.keys(universe).sort();
  const n = syms.length;
  const w = {};
  for (const s of syms) {
    const b = universe[s], e = b.length - 1;
    if (b.length < need) { w[s] = 1 / n; continue; }
    let sum = 0;
    for (let k = e - sma + 1; k <= e; k++) sum += b[k].close;
    w[s] = b[e].close > sum / sma ? 1 / n : 0;
  }
  return w;
}
