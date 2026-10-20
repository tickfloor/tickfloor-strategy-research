// SSRN run 3, control C3: the same rule with a deterministic pseudo-random tercile dropped (FNV-1a hash of symbol + month; no randomness source).
export const meta = {
  id: "ssrn-mom-randt3-ctrl",
  name: "Control C3: 12-1 momentum excluding a hashed pseudo-random tercile (wide US stocks)",
  family: "deep-validation-control",
  source: "Pseudo-random dumb control for run 3; prereg research/prereg-2026-10-07-ssrn.md",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { lookback: 252, skip: 21, top: 4, win: 336 },
};

function fnv(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}

export function rank(universe, t, ctx) {
  const { lookback, skip, top, win } = ctx.params;
  const month = Math.floor(t / 2629800);
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < win + 1) continue;
    scored.push([sym, fnv(`${sym}|${month}`), b[b.length - 1 - skip].close / b[b.length - 1 - lookback].close - 1]);
  }
  if (scored.length < top * 3) return {};
  scored.sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1));
  const keep = scored.slice(Math.floor(scored.length / 3));
  keep.sort((p, q) => q[2] - p[2] || (p[0] < q[0] ? -1 : 1));
  const w = {};
  for (const [sym] of keep.slice(0, top)) w[sym] = 1 / top;
  return w;
}
