// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-13), frozen before code.
// Ref: Frazzini & Pedersen 2014 JFE (rank weights); Asness, Moskowitz & Pedersen 2013 JF.
export const meta = {
  id: "c1022-redteam-13",
  name: "Crypto 3-week momentum, rank weights across the whole cross-section (no top-K cut)",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  params: { lookback: 21, need: 23, minNames: 8 },
};

export function rank(universe, t, ctx) {
  const { lookback, need, minNames } = ctx.params;
  const syms = Object.keys(universe);
  const ew = {};
  for (const s of syms) ew[s] = 1 / syms.length;
  const rows = [];
  for (const s of syms) {
    const b = universe[s];
    if (b.length < need) continue;
    const e = b.length - 1;
    rows.push([s, b[e].close / b[e - lookback].close - 1]);
  }
  if (rows.length < minNames) return syms.length ? ew : {};
  rows.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const n = rows.length;
  const T = (n * (n + 1)) / 2;
  const w = {};
  // position q = 1 is the best score; weight (n - q + 1) / T
  rows.forEach(([s], idx) => { w[s] = (n - (idx + 1) + 1) / T; });
  return w;
}
