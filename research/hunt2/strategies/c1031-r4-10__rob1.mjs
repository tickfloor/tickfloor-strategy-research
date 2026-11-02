// c1031 round-4 spec c1031-r4-10 (campaign-1031/prereg-r4.json, frozen before code).
// Fear & Greed regime with thresholds 50/30 and a one-week hysteresis on regime flips. Greed: top 4 two-week
// momentum; fear: cash; neutral: equal weight. Weekly, long-only.
export const meta = {
  id: "c1031-r4-10__rob1",
  name: "r3-07 with Fear & Greed thresholds 50/30 (-10) and a one-week hysteresis on regime flips, weekly (-25%)",
  family: "sentiment",
  source: "c1031/r4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { greed: 50, fear: 30, lookback: 11, top: 4, hysteresisWeeks: 1 },
};

const GREED = "GREED";
const FEAR = "FEAR";
const NEUTRAL = "NEUTRAL";
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ewOver(names) {
  const w = {};
  for (const s of names) w[s] = 1 / names.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { greed, fear, lookback, top } = ctx.params;
  const g = ctx.macro("FNG");
  const raw = g != null && g >= greed ? GREED : g != null && g <= fear ? FEAR : NEUTRAL;

  // effective regime flips only after the new raw regime is seen at two consecutive weekly decisions
  if (ctx.state.eff === undefined) {
    ctx.state.eff = raw;
    ctx.state.prev = raw;
  } else {
    if (raw !== ctx.state.eff && ctx.state.prev === raw) ctx.state.eff = raw;
    ctx.state.prev = raw;
  }
  const eff = ctx.state.eff;

  if (eff === FEAR) return {};
  const eligible = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < lookback + 1) continue;
    const e = b.length - 1;
    eligible.push({ sym, score: b[e].close / b[e - lookback].close - 1 });
  }
  if (eff === GREED) {
    eligible.sort((x, y) => y.score - x.score || cmp(x.sym, y.sym));
    return ewOver(eligible.slice(0, top).map((r) => r.sym));
  }
  return ewOver(eligible.map((r) => r.sym));
}
