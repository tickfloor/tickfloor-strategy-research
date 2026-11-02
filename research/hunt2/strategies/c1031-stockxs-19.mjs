// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-19). Down-streak reversal, daily.
export const meta = {
  id: "c1031-stockxs-19",
  name: "Down-streak reversal: buy up to 5 large caps that have closed lower for at least 3 days in a row, daily",
  family: "mean_reversion",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { minStreak: 3, top: 5 },
};

const ok = (x) => Number.isFinite(x) && x > 0;

export function rank(universe, t, ctx) {
  const { minStreak, top } = ctx.params;
  const cands = [];
  for (const sym of Object.keys(universe).sort()) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < 12) continue;
    let good = true;
    for (let k = e - 10; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    if (!good) continue;
    let streak = 0;
    for (let k = e; k >= e - 9; k--) {
      if (b[k].close / b[k - 1].close - 1 < 0) streak++;
      else break;
    }
    if (streak < minStreak) continue;
    cands.push({ sym, streak, rel: b[e].close / b[e - streak].close - 1 });
  }
  cands.sort((x, y) => y.streak - x.streak || x.rel - y.rel || (x.sym < y.sym ? -1 : 1));
  const pick = cands.slice(0, top);
  if (pick.length === 0) return {};
  const w = {};
  for (const c of pick) w[c.sym] = 1 / top;
  return w;
}
