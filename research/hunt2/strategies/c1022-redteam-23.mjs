// c1022 red-team spec 23 (campaign-1022/prereg-redteam.json, frozen before code).
// Zweig 1986; Faber 2007. Equal-weight crypto scaled continuously by 50-day breadth, weekly.
export const meta = {
  id: "c1022-redteam-23",
  name: "Equal-weight crypto scaled continuously by 50-day breadth, weekly",
  family: "breadth",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { sma: 50, need: 52, minCoins: 6 },
};

export function rank(universe, t, ctx) {
  const { sma, need, minCoins } = ctx.params;
  const syms = Object.keys(universe);
  const n = syms.length;

  let qual = 0;
  let above = 0;
  for (const sym of syms) {
    const b = universe[sym];
    if (b.length < need) continue;
    qual++;
    const e = b.length - 1;
    let s = 0;
    for (let k = e - sma + 1; k <= e; k++) s += b[k].close;
    if (b[e].close > s / sma) above++;
  }

  // fewer than minCoins with enough history = breadth undefined -> 1 (fully invested)
  const breadth = qual < minCoins ? 1 : above / qual;

  const w = {};
  for (const sym of syms) w[sym] = breadth / n;
  return w;
}
