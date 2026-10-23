// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-46). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-46",
  name: "Narrow leadership: BTC at a 50-day high while alt breadth is weak",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { win: 50, sma: 50, breadthLo: 0.4, top: 5, momLb: 20 },
};

export function rank(universe, t, ctx) {
  const { win, sma, breadthLo, top, momLb } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc) return {};
  const n = btc.length;
  let btcHigh = false;
  if (n >= win) {
    let mx = -Infinity;
    for (let j = n - win; j < n; j++) mx = Math.max(mx, btc[j].close);
    btcHigh = btc[n - 1].close >= mx;
  }
  const alts = Object.keys(universe).filter((k) => k !== "BTCUSDT");
  // breadth = share of alts (with >= sma bars) closing above their sma
  const withSma = alts.filter((k) => universe[k].length >= sma);
  let above = 0;
  for (const k of withSma) {
    const b = universe[k];
    let s = 0;
    for (let j = b.length - sma; j < b.length; j++) s += b[j].close;
    if (b[b.length - 1].close > s / sma) above++;
  }
  const breadth = withSma.length ? above / withSma.length : NaN;
  if (btcHigh && breadth < breadthLo) return { BTCUSDT: 1 };
  if (breadth >= breadthLo) {
    const picks = alts
      .filter((k) => universe[k].length > momLb)
      .map((k) => {
        const b = universe[k];
        return [k, b[b.length - 1].close / b[b.length - 1 - momLb].close - 1];
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, top);
    if (!picks.length) return {};
    const w = {};
    for (const [k] of picks) w[k] = 1 / picks.length;
    return w;
  }
  return {};
}
