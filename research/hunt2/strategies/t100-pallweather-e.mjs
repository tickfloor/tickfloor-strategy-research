// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-pallweather-e",
  "name": "All Weather (Dalio): 30% QQQ, 40% TLT, 15% IEF, 7.5% GLD, 7.5% DBC, monthly",
  "family": "top100-1006",
  "source": "Ray Dalio All Weather portfolio, a top retail portfolio search; QQQ stands in for the holdout SPY",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "TLT",
    "IEF",
    "GLD",
    "DBC"
  ],
  "rebalance": "monthly",
  "params": {
    "QQQ": 0.3,
    "TLT": 0.4,
    "IEF": 0.15,
    "GLD": 0.075,
    "DBC": 0.075
  }
};

export function rank(universe, t, ctx) {
  const W = {"QQQ":0.3,"TLT":0.4,"IEF":0.15,"GLD":0.075,"DBC":0.075};
  const w = {};
  for (const sym of Object.keys(W)) if (universe[sym]) w[sym] = W[sym];
  return w;
}
