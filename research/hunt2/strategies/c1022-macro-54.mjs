// Spec: campaign-1022/prereg-macro.json c1022-macro-54 (rank, monthly).
// Sector momentum while VIX3M trends down, defensives otherwise. Source: Barroso & Santa-Clara (2015).
const SECTORS = ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"];

export const meta = {
  id: "c1022-macro-54",
  name: "Sector momentum while VIX3M trends down, defensives otherwise",
  family: "momentum",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: SECTORS,
  rebalance: "monthly",
  params: { mom: 126, topN: 3, sma: 50 },
};

// Equal weight across the listed symbols present in universe (FILL).
function ew(universe, list) {
  const present = list.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = 1 / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  if (ctx.state.vix3m === undefined) ctx.state.vix3m = [];
  ctx.state.vix3m.push(ctx.macro("VIX3M"));
  const hist = ctx.state.vix3m;
  // PREREG FIX: "below its 50-day average" = current < mean of last 3 recorded (current included).
  const recent = hist.slice(-3);
  if (recent.length < 3 || recent.some((v) => v == null)) return ew(universe, SECTORS);
  const mean = (recent[0] + recent[1] + recent[2]) / 3;
  if (!(hist[hist.length - 1] < mean)) return ew(universe, ["XLP", "XLU", "XLV"]);
  const scores = [];
  for (const s of SECTORS) {
    const b = universe[s];
    if (!b || b.length < 127) continue;
    scores.push([s, b[b.length - 1].close / b[b.length - 1 - 126].close - 1]);
  }
  scores.sort((x, y) => y[1] - x[1]);
  const w = {};
  for (const [s] of scores.slice(0, 3)) w[s] = 1 / 3;
  return w;
}
