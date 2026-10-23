export const meta = {
  id: "c1022-acad-31",
  name: "Crypto long-term reversal: bottom 6 by 52-week return skipping the last 4 weeks, weekly",
  family: "mean_reversion",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  params: { startBars: 365, endBars: 28, bottomN: 6 },
};

// lt = close[t-28] / close[t-365] - 1. Long the bottomN lowest-lt names at weight 1/6 each; cash if fewer than 3 are eligible.
export function rank(universe, t, ctx) {
  const { startBars, endBars, bottomN } = ctx.params;
  const rows = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= startBars + 1) continue;
    const L = b.length - 1;
    rows.push([s, b[L - endBars].close / b[L - startBars].close - 1]);
  }
  if (rows.length < 3) return {};
  rows.sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : 1));
  const w = {};
  for (const [s] of rows.slice(0, bottomN)) w[s] = 1 / bottomN;
  return w;
}
