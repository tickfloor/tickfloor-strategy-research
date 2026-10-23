export const meta = {
  id: "c1022-macro-13",
  name: "Crypto cross-sectional momentum, flat when VIX is above 25",
  family: "momentum",
  source: "c1022/macro",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { lookback: 28, topN: 5, vixCap: 25 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const v = ctx.macro("VIX");
  if (v === null) { // DEFS: null input with no stated default -> FILL
    const syms = Object.keys(universe), w = {};
    for (const s of syms) w[s] = 1 / syms.length;
    return w;
  }
  if (v >= p.vixCap) return {};
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < p.lookback + 1) continue;
    scored.push([sym, b[b.length - 1].close / b[b.length - 1 - p.lookback].close - 1]);
  }
  scored.sort((x, y) => y[1] - x[1]);
  const out = {};
  for (const [sym] of scored.slice(0, p.topN)) out[sym] = 1 / p.topN;
  return out;
}
