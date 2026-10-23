// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-34). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-34",
  name: "Dispersion-conditioned momentum: pick winners only when coins disagree",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { retLb: 7, dispHist: 52, dispPct: 0.8, top: 3 },
};

export function rank(universe, t, ctx) {
  const { retLb, dispHist, dispPct, top } = ctx.params;
  const s = ctx.state;
  if (!s.disps) s.disps = [];
  // coins with >= retLb+1 bars (8 for the 7-day return)
  const rets = Object.keys(universe)
    .filter((k) => universe[k].length > retLb)
    .map((k) => {
      const b = universe[k];
      return [k, b[b.length - 1].close / b[b.length - 1 - retLb].close - 1];
    });
  let pct = NaN;
  if (rets.length >= 2) {
    const mean = rets.reduce((a, x) => a + x[1], 0) / rets.length;
    const disp = Math.sqrt(rets.reduce((a, x) => a + (x[1] - mean) ** 2, 0) / rets.length);
    // rank of today's dispersion among the last dispHist stored weekly values
    if (s.disps.length >= dispHist) pct = s.disps.filter((v) => v <= disp).length / s.disps.length;
    s.disps.push(disp);
    if (s.disps.length > dispHist) s.disps.shift();
  }
  if (pct >= dispPct) {
    const picks = rets.slice().sort((a, b) => b[1] - a[1]).slice(0, top);
    const w = {};
    for (const [k] of picks) w[k] = 1 / picks.length;
    return w;
  }
  return { BTCUSDT: 1 };
}
