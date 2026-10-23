// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-45). Portfolio rank mode, weekly.

export const meta = {
  id: "c1022-crypto-45__rob2",
  name: "Volume-share dominance: BTC's share of market turnover rising = risk-off (+25%)",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { sWin: 9, lWin: 60, top: 5, momLb: 20 },
};

export function rank(universe, t, ctx) {
  const { sWin, lWin, top, momLb } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < lWin) return {};
  // dollar-volume maps by time for every coin over the last lWin days
  const maps = Object.keys(universe).map((k) => {
    const b = universe[k];
    const m = new Map();
    for (let j = Math.max(0, b.length - lWin); j < b.length; j++) m.set(b[j].time, b[j].close * b[j].volume);
    return [k, m];
  });
  const shares = [];
  for (let j = btc.length - lWin; j < btc.length; j++) {
    const tm = btc[j].time;
    let tot = 0;
    let btcv = 0;
    for (const [k, m] of maps) {
      const v = m.get(tm);
      if (v === undefined) continue;
      tot += v;
      if (k === "BTCUSDT") btcv = v;
    }
    shares.push(tot > 0 ? btcv / tot : NaN);
  }
  const mean = (xs) => xs.reduce((a, x) => a + x, 0) / xs.length;
  if (mean(shares.slice(-sWin)) > mean(shares)) return { BTCUSDT: 1 };
  const picks = Object.keys(universe)
    .filter((k) => k !== "BTCUSDT" && universe[k].length > momLb)
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
