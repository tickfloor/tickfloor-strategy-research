// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-ppermanent-e",
  "name": "Permanent Portfolio (Browne): 25% each QQQ, TLT, GLD, SHY, monthly",
  "family": "top100-1006",
  "source": "Harry Browne Permanent Portfolio, a Bogleheads staple; QQQ stands in for the holdout SPY",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "TLT",
    "GLD",
    "SHY"
  ],
  "rebalance": "monthly",
  "params": {
    "QQQ": 0.25,
    "TLT": 0.25,
    "GLD": 0.25,
    "SHY": 0.25
  }
};

export function rank(universe, t, ctx) {
  const W = {"QQQ":0.25,"TLT":0.25,"GLD":0.25,"SHY":0.25};
  const w = {};
  for (const sym of Object.keys(W)) if (universe[sym]) w[sym] = W[sym];
  return w;
}
