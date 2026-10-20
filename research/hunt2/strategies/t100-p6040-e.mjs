// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-p6040-e",
  "name": "Static 60/40: 60% QQQ, 40% AGG, rebalanced monthly",
  "family": "top100-1006",
  "source": "60/40 portfolio, the default retail allocation (Bogle/Vanguard content); QQQ stands in for the holdout SPY",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "AGG"
  ],
  "rebalance": "monthly",
  "params": {
    "QQQ": 0.6,
    "AGG": 0.4
  }
};

export function rank(universe, t, ctx) {
  const W = {"QQQ":0.6,"AGG":0.4};
  const w = {};
  for (const sym of Object.keys(W)) if (universe[sym]) w[sym] = W[sym];
  return w;
}
