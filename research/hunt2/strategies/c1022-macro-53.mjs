export const meta = {
  "id": "c1022-macro-53",
  "name": "BTC-only when the dollar is rising, top alts when it is falling",
  "family": "momentum",
  "source": "c1022/macro",
  "assetClass": "crypto",
  "timeframe": "1d",
  "rebalance": "weekly",
  "params": {
    "lookback": 63,
    "mom": 28,
    "topN": 4
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Rank-mode weekly crypto: dollar rising over lookback -> BTC 1.0, else top topN non-BTC by mom-bar return, equal.
// chg counted in weekly calls: s = round(lookback / 5) (63 -> 13). Null chg -> FILL (DEFS).
function recordMacro(ctx, id) {
  const key = "m_" + id;
  if (ctx.state[key] === undefined) ctx.state[key] = [];
  ctx.state[key].push(ctx.macro(id));
  return ctx.state[key];
}
function chgCalls(arr, s) {
  const last = arr.length - 1;
  if (last - s < 0) return null;
  const a = arr[last];
  const b = arr[last - s];
  if (a == null || b == null) return null;
  return a - b;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const dw = recordMacro(ctx, "DTWEXBGS");
  const dc = chgCalls(dw, Math.round(p.lookback / 5));
  if (dc === null) { // DEFS: macro history too short / null -> FILL
    const syms = Object.keys(universe), w = {};
    for (const s of syms) w[s] = 1 / syms.length;
    return w;
  }
  if (dc > 0) return universe.BTCUSDT ? { BTCUSDT: 1 } : {};
  const scores = [];
  for (const s of Object.keys(universe)) {
    if (s === "BTCUSDT") continue;
    const b = universe[s];
    if (b.length < p.mom + 1) continue;
    scores.push([s, b[b.length - 1].close / b[b.length - 1 - p.mom].close - 1]);
  }
  scores.sort((x, y) => y[1] - x[1]);
  const w = {};
  for (const [s] of scores.slice(0, p.topN)) w[s] = 1 / p.topN;
  return w;
}
