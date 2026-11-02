// c1031 round-4 spec c1031-r4-28 (campaign-1031/prereg-r4.json, frozen before code).
// 9-ETF dual momentum: top 2 risk ETFs above the SHY hurdle at 1/2 each; unfilled slots go to the best bond. Monthly, long-only.
export const meta = {
  id: "c1031-r4-28__rob1",
  name: "9-ETF dual momentum with the SHY hurdle holding the top 2 risk assets (equal weight, unfilled slots in the best bond), monthly (-25%)",
  family: "trend",
  source: "c1031/r4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "GLD", "DBC", "VNQ", "AGG", "IEF", "TLT", "SHY"],
  rebalance: "monthly",
  params: { lookback: 189, need: 191, risk: ["QQQ", "DIA", "GLD", "DBC", "VNQ"], bonds: ["AGG", "IEF", "TLT"], hurdle: "SHY", slots: 2 },
};

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// trailing total return over lookback bars; null when missing or shorter than need
function R(universe, s, ctx) {
  const b = universe[s];
  if (!b || b.length < ctx.params.need) return null;
  const e = b.length - 1;
  return b[e].close / b[e - ctx.params.lookback].close - 1;
}

// scored members of a list as [sym, R], best first (ties by name ascending)
function ranked(universe, list, ctx) {
  return list
    .map((s) => [s, R(universe, s, ctx)])
    .filter((x) => x[1] !== null)
    .sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
}

export function rank(universe, t, ctx) {
  const { risk, bonds, hurdle, slots } = ctx.params;
  if (!Object.keys(universe).some((s) => R(universe, s, ctx) !== null)) return ew(universe);

  const hR = R(universe, hurdle, ctx);
  const hurdleR = hR === null ? 0 : hR;
  const picks = ranked(universe, risk, ctx)
    .filter((x) => x[1] > hurdleR)
    .slice(0, slots);
  const w = 1 / slots;
  const out = {};
  for (const [s] of picks) out[s] = w;

  const unfilled = slots - picks.length;
  const bond = ranked(universe, bonds, ctx)[0];
  if (unfilled > 0 && bond) out[bond[0]] = (out[bond[0]] || 0) + unfilled * w;
  return out;
}
