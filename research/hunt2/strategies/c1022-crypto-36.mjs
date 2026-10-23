// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-36). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-36",
  name: "Large-cap vs mid-cap crypto rotation by relative momentum",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { dvWin: 30, n: 6, momLb: 30 },
};

const ret = (b, n) => b[b.length - 1].close / b[b.length - 1 - n].close - 1;

export function rank(universe, t, ctx) {
  const { dvWin, n, momLb } = ctx.params;
  const coins = Object.keys(universe).filter((k) => universe[k].length > Math.max(dvWin, momLb));
  if (coins.length < 2 * n) return { BTCUSDT: 1 };
  // mean 30-day dollar volume (close * volume)
  const dv = coins.map((k) => {
    const b = universe[k];
    let s = 0;
    for (let j = b.length - dvWin; j < b.length; j++) s += b[j].close * b[j].volume;
    return [k, s / dvWin];
  });
  dv.sort((a, b) => b[1] - a[1]);
  const large = dv.slice(0, n).map((x) => x[0]);
  const mid = dv.slice(-n).map((x) => x[0]);
  const mom = (g) => g.reduce((a, k) => a + ret(universe[k], momLb), 0) / g.length;
  const pick = mom(large) >= mom(mid) ? large : mid;
  const w = {};
  for (const k of pick) w[k] = 1 / pick.length;
  return w;
}
