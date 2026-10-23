export const meta = {
  id: "c1022-acad-27",
  name: "Volatility targeting on credit ETFs (HYG, LQD), 5% target, weekly (Harvey et al. 'impact of volatility targeting')",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["HYG", "LQD"],
  rebalance: "weekly",
  params: { volBars: 21, targetVol: 0.05, maxWeight: 0.5 },
};

function retSd(b, n) {
  const rets = [];
  for (let k = b.length - n; k < b.length; k++) rets.push(b[k].close / b[k - 1].close - 1);
  let m = 0;
  for (const x of rets) m += x;
  m /= n;
  let s = 0;
  for (const x of rets) s += (x - m) * (x - m);
  return Math.sqrt(s / (n - 1));
}

// Per-asset weight w_i = min(0.5, 0.5 * 0.05 / vol_i), vol_i = 21-day sample std * sqrt(252). Remainder is cash.
export function rank(universe, t, ctx) {
  const { volBars, targetVol, maxWeight } = ctx.params;
  const w = {};
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= volBars + 1) continue;
    const vol = retSd(b, volBars) * Math.sqrt(252);
    w[s] = vol > 0 ? Math.min(maxWeight, (maxWeight * targetVol) / vol) : maxWeight;
  }
  return w;
}
