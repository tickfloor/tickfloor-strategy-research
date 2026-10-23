// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-33). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-33",
  name: "Dominance extreme mean-reversion: rotate into alts after BTC has outrun them",
  family: "momentum",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { lb: 60, spread: 0.2, hold: 30 },
};

const DAY = 86400;
// n-day return ending at the last bar; needs n+1 bars
const ret = (b, n) => b[b.length - 1].close / b[b.length - 1 - n].close - 1;

export function rank(universe, t, ctx) {
  const { lb, spread, hold } = ctx.params;
  const s = ctx.state;
  const btc = universe.BTCUSDT;
  if (!btc) return {};
  const alts = Object.keys(universe).filter((k) => k !== "BTCUSDT" && universe[k].length > lb);
  // leg ends at the first rebalance where t - entryT >= hold days
  if (s.leg && t - s.leg.entryT >= hold * DAY) s.leg = null;
  if (!s.leg && btc.length > lb && alts.length) {
    const btcRet = ret(btc, lb);
    const altMean = alts.reduce((a, k) => a + ret(universe[k], lb), 0) / alts.length;
    if (btcRet - altMean >= spread) s.leg = { entryT: t, syms: alts };
  }
  if (s.leg) {
    const w = {};
    for (const k of s.leg.syms) if (universe[k]) w[k] = 1 / s.leg.syms.length; // weights fixed; a coin with no bar today sits out
    return w;
  }
  return { BTCUSDT: 1 };
}
