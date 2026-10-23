// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-44). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-44",
  name: "Sector rotation: PoW payment coins vs smart-contract/DeFi coins",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: {
    momLb: 30,
    pow: ["LTCUSDT", "BCHUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "DOGEUSDT"],
    sc: ["ADAUSDT", "AVAXUSDT", "NEARUSDT", "LINKUSDT", "UNIUSDT", "AAVEUSDT"],
  },
};

export function rank(universe, t, ctx) {
  const { momLb, pow, sc } = ctx.params;
  // members with enough history for the 30-day return
  const members = (list) => list.filter((k) => universe[k] && universe[k].length > momLb);
  const mom = (g) => g.reduce((a, k) => {
    const b = universe[k];
    return a + (b[b.length - 1].close / b[b.length - 1 - momLb].close - 1);
  }, 0) / g.length;
  const pm = members(pow);
  const sm = members(sc);
  let pick;
  if (!pm.length && !sm.length) return {};
  if (!sm.length) pick = pm;
  else if (!pm.length) pick = sm;
  else pick = mom(pm) >= mom(sm) ? pm : sm;
  const w = {};
  for (const k of pick) w[k] = 1 / pick.length;
  return w;
}
