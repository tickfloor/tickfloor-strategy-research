export const meta = {
  "id": "c1022-macro-36",
  "name": "Silver/gold ratio trend as the equity risk-on gate",
  "family": "other",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "SLV",
    "GLD",
    "QQQ",
    "DIA"
  ],
  "rebalance": "daily",
  "params": {
    "sma": 50
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Rank-mode gate: SLV/GLD ratio above its own 50-bar mean -> QQQ+DIA (SLV/GLD signal only).
// FILL (not ready) = equal weight across all present listed symbols (DEFS; benchmark-neutral).
function smaClose(b, n) {
  let s = 0;
  for (let k = 0; k < n; k++) s += b[b.length - 1 - k].close;
  return s / n;
}
function basket(universe, syms, total) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = total / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const S = universe.SLV;
  const G = universe.GLD;
  if (!S || !G || S.length < p.sma || G.length < p.sma) return basket(universe, ["SLV", "GLD", "QQQ", "DIA"], 1);
  let sum = 0;
  for (let k = 0; k < p.sma; k++) sum += S[S.length - 1 - k].close / G[G.length - 1 - k].close;
  const mean = sum / p.sma;
  const r = S[S.length - 1].close / G[G.length - 1].close;
  return r > mean ? basket(universe, ["QQQ", "DIA"], 1) : {};
}
