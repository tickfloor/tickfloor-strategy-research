export const meta = {
  id: "c1022-macro-09",
  name: "Sector beta rotation by VIX percentile (cyclicals when calm, defensives when stressed)",
  family: "other",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLY", "XLF", "XLI", "XLB", "XLP", "XLU", "XLV"],
  rebalance: "weekly",
  params: { window: 252, lo: 0.3, hi: 0.7 },
};

// prereg fix: rank() runs weekly, so the percentile uses the last 52 recorded weekly VIX values.
const WIN = 52;
const ALL = ["XLK", "XLY", "XLF", "XLI", "XLB", "XLP", "XLU", "XLV"];
const CYC = ["XLK", "XLY", "XLF", "XLI", "XLB"];
const DEF = ["XLP", "XLU", "XLV"];

function equalWeight(list, universe) {
  const present = list.filter((s) => Object.hasOwn(universe, s));
  const out = {};
  for (const s of present) out[s] = 1 / present.length;
  return out;
}

export function rank(universe, t, ctx) {
  if (ctx.state.vix === undefined) ctx.state.vix = [];
  const v = ctx.macro("VIX");
  if (v === null) return equalWeight(ALL, universe); // DEFS: null input -> FILL
  const h = ctx.state.vix;
  h.push(v);
  if (h.length > WIN) h.shift();
  if (h.length < WIN) return equalWeight(ALL, universe);
  let le = 0;
  for (const x of h) if (x <= v) le++;
  const pct = le / WIN;
  if (pct < ctx.params.lo) return equalWeight(CYC, universe);
  if (pct > ctx.params.hi) return equalWeight(DEF, universe);
  return equalWeight(ALL, universe);
}
