// c1022 red-team spec 62: equal-weight crypto basket gated by BTC's own SMA grid (market-level trend only).
// Source: Liu & Tsyvinski 2021 RFS (crypto market factor); Hurst, Ooi & Pedersen 2017 JPM.
export const meta = {
  id: "c1022-redteam-62",
  name: "Equal-weight crypto basket gated by BTC's own SMA grid (market-level trend only)",
  family: "trend",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { windows: [10, 15, 20, 30, 40, 50, 75, 100, 150, 200], need: 202 },
};

export function rank(universe, t, ctx) {
  const { windows, need } = ctx.params;
  const syms = Object.keys(universe);
  const n = syms.length;
  if (n === 0) return {};

  let frac = 1; // BTC warm-up (fewer than `need` bars): fully invested
  const btc = universe.BTCUSDT;
  if (btc && btc.length >= need) {
    const e = btc.length - 1;
    const c = btc[e].close;
    let k = 0;
    for (const W of windows) {
      let sum = 0;
      for (let j = e - W + 1; j <= e; j++) sum += btc[j].close;
      if (c > sum / W) k++;
    }
    frac = k / windows.length;
  }

  const w = {};
  for (const sym of syms) w[sym] = frac / n;
  return w;
}
