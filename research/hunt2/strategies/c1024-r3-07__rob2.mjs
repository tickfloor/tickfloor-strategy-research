// c1024 round-3 spec c1024-r3-07 (campaign-1024/prereg-r3.json, frozen before code).
// r2-09 leg (a): greed = top-4 two-week momentum, fear = cash, neutral/null = equal weight of eligible. Weekly, long-only.
export const meta = {
  id: "c1024-r3-07__rob2",
  name: "r2-09 leg (a): two-week momentum top 4 in greed, cash in fear, equal weight when neutral or unavailable, weekly (+25%)",
  family: "sentiment",
  source: "c1024/r3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { greed: 60, fear: 40, lookback: 18, top: 4 },
};

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ewOver(names) {
  const w = {};
  for (const s of names) w[s] = 1 / names.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { greed, fear, lookback, top } = ctx.params;
  const g = ctx.macro("FNG");

  const eligible = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < lookback + 1) continue;
    const e = b.length - 1;
    eligible.push({ sym, score: b[e].close / b[e - lookback].close - 1 });
  }

  if (g != null && g >= greed) {
    eligible.sort((x, y) => y.score - x.score || cmp(x.sym, y.sym));
    return ewOver(eligible.slice(0, top).map((r) => r.sym));
  }
  if (g != null && g <= fear) return {};
  return ewOver(eligible.map((r) => r.sym));
}
