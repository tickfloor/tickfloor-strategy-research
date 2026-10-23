export const meta = {
  id: "c1022-macro-14",
  name: "BTC-only when VIX is above its yearly median, top alts otherwise",
  family: "momentum",
  source: "c1022/macro",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { window: 252, lookback: 28, topN: 4 },
};

// prereg fix: rank() runs weekly, so the median uses the last 52 recorded weekly VIX values.
const WIN = 52;

function equalWeight(universe) {
  const syms = Object.keys(universe);
  const out = {};
  for (const s of syms) out[s] = 1 / syms.length;
  return out;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (ctx.state.vix === undefined) ctx.state.vix = [];
  const v = ctx.macro("VIX");
  if (v === null) return equalWeight(universe); // DEFS: null input -> FILL
  const h = ctx.state.vix;
  h.push(v);
  if (h.length > WIN) h.shift();
  if (h.length < WIN) return equalWeight(universe); // prereg fill while history is short
  const sorted = [...h].sort((a, b) => a - b);
  const med = (sorted[WIN / 2 - 1] + sorted[WIN / 2]) / 2;
  if (v > med) return Object.hasOwn(universe, "BTCUSDT") ? { BTCUSDT: 1 } : {};
  const scored = [];
  for (const sym of Object.keys(universe)) {
    if (sym === "BTCUSDT") continue;
    const b = universe[sym];
    if (b.length < p.lookback + 1) continue;
    scored.push([sym, b[b.length - 1].close / b[b.length - 1 - p.lookback].close - 1]);
  }
  scored.sort((x, y) => y[1] - x[1]);
  const out = {};
  for (const [sym] of scored.slice(0, p.topN)) out[sym] = 0.25;
  return out;
}
