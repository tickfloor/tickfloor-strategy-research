// c1022 red-team spec 29: max of the fear grid and the SMA grid (trend or capitulation), daily.
// Source: Antoniou, Doukas & Subrahmanyam 2013 JFQA.
export const meta = {
  id: "c1022-redteam-29",
  name: "Max of the fear grid and the SMA grid: trend or capitulation, daily",
  family: "sentiment",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: {
    thresholds: [10, 15, 20, 25],
    horizons: [60, 90, 120],
    windows: [10, 15, 20, 30, 40, 50, 75, 100, 150, 200],
    need: 202,
  },
};

export function rank(universe, t, ctx) {
  const { thresholds, horizons, windows, need } = ctx.params;
  const syms = Object.keys(universe);
  const n = syms.length;
  if (n === 0) return {};

  let e = 0;
  for (const sym of syms) if (universe[sym].length - 1 > e) e = universe[sym].length - 1;

  if (ctx.state.last === undefined) ctx.state.last = {};
  const fng = ctx.macro("FNG");
  for (const th of thresholds) {
    if (fng !== null && fng !== undefined && fng <= th) ctx.state.last[th] = e;
  }
  let hits = 0;
  for (const th of thresholds) {
    for (const H of horizons) {
      const last = ctx.state.last[th];
      if (last !== undefined && e - last <= H - 1) hits++;
    }
  }
  const fearFrac = hits / (thresholds.length * horizons.length);

  const w = {};
  for (const sym of syms) {
    const b = universe[sym];
    const L = b.length;
    let trendFrac = 1; // warm-up: symbol has fewer than `need` bars
    if (L >= need) {
      const es = L - 1;
      const c = b[es].close;
      let k = 0;
      for (const W of windows) {
        let sum = 0;
        for (let j = es - W + 1; j <= es; j++) sum += b[j].close;
        if (c > sum / W) k++;
      }
      trendFrac = k / windows.length;
    }
    w[sym] = Math.max(fearFrac, trendFrac) / n;
  }
  return w;
}
