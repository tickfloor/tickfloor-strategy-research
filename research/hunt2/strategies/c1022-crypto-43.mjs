// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-43). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-43",
  name: "Relative-strength breakout versus BTC: alts making a 50-day high in their BTC ratio",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { win: 50, maxN: 5 },
};

export function rank(universe, t, ctx) {
  const { win, maxN } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc) return {};
  if (btc.length < win + 1) return { BTCUSDT: 1 }; // no candidates possible yet -> BTC (spec)
  // aligned BTC times for the last win+1 bars: R[0] is win days ago, R[win] is today
  const off = btc.length - win - 1;
  const cands = [];
  for (const k of Object.keys(universe)) {
    if (k === "BTCUSDT") continue;
    const b = universe[k];
    if (b.length < win + 1) continue;
    const am = new Map();
    for (let j = b.length - win - 1; j < b.length; j++) am.set(b[j].time, b[j].close);
    const R = [];
    let ok = true;
    for (let j = 0; j <= win; j++) {
      const bj = btc[off + j];
      const a = am.get(bj.time);
      if (a === undefined) { ok = false; break; }
      R.push(a / bj.close);
    }
    if (!ok) continue;
    // today's ratio must be the highest of the last win days (indices 1..win)
    if (R[win] < Math.max(...R.slice(1))) continue;
    cands.push([k, R[win] / R[0] - 1]);
  }
  const picks = cands.sort((a, b) => b[1] - a[1]).slice(0, maxN);
  if (!picks.length) return { BTCUSDT: 1 };
  const w = {};
  for (const [k] of picks) w[k] = 1 / picks.length;
  return w;
}
