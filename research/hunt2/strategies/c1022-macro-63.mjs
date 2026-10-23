// Spec: campaign-1022/prereg-macro.json c1022-macro-63 (rank, monthly).
// Cross-asset 12-1 momentum, top 5 of 20, with a vol-regime cash override. Source: Daniel & Moskowitz (2016).
const ASSETS = ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "VNQ", "TLT", "IEF", "LQD", "HYG", "GLD", "SLV", "DBC", "SHY"];

export const meta = {
  id: "c1022-macro-63",
  name: "Cross-asset 12-1 momentum, top 5 of 20, with a vol-regime cash override",
  family: "momentum",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ASSETS,
  rebalance: "monthly",
  params: { topN: 5 },
};

// Equal weight across the listed symbols present in universe (FILL).
function ew(universe, list) {
  const present = list.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = 1 / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  if (ctx.state.vix === undefined) { ctx.state.vix = []; ctx.state.vix3m = []; }
  ctx.state.vix.push(ctx.macro("VIX"));
  ctx.state.vix3m.push(ctx.macro("VIX3M"));
  const k = ctx.state.vix.length - 1;
  const vix = ctx.state.vix[k], vix3m = ctx.state.vix3m[k];
  // FILL until every listed symbol has >= 253 bars; also FILL while macro history is not ready.
  const ready = ASSETS.every((s) => universe[s] && universe[s].length >= 253);
  if (!ready || vix == null || vix3m == null) return ew(universe, ASSETS);
  if (vix > vix3m) return { SHY: 1 };
  const scores = [];
  for (const s of ASSETS) {
    if (s === "SHY") continue;
    const b = universe[s];
    scores.push([s, b[b.length - 22].close / b[b.length - 253].close - 1]);
  }
  scores.sort((x, y) => y[1] - x[1]);
  const w = {};
  for (const [s] of scores.slice(0, ctx.params.topN)) w[s] = 1 / ctx.params.topN;
  return w;
}
