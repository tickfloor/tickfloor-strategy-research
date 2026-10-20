// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-local-transfer-rebalancing). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-local-transfer-rebalancing",
  "name": "Does correcting only the largest ETF allocation gap work?",
  "family": "rebalance-control",
  "source": "retail trading content: pairwise extreme sleeve transfer rebalancing four asset portfolio",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "TLT",
    "GLD",
    "SHY"
  ],
  "rebalance": "daily",
  "longShort": false,
  "params": {
    "warmupBars": 2,
    "targetWeight": 0.25,
    "minPairGap": 0.06,
    "transferFraction": 0.5
  }
};

export function rank(universe, t, ctx) {
  const p = ctx.params, s = ctx.state, syms = ["GLD", "QQQ", "SHY", "TLT"];
  const px = {};
  for (const k of syms) {
    const b = universe[k];
    if (!b || b.length < p.warmupBars || !b.slice(-2).every((x) => Number.isFinite(x.close) && x.close > 0)) { s.init = false; return {}; }
    px[k] = b[b.length - 1].close;
  }
  const w = {};
  if (!s.init) {
    s.init = true; s.n = {};
    for (const k of syms) { s.n[k] = p.targetWeight / px[k]; w[k] = p.targetWeight; }
    return w;
  }
  let total = 0;
  for (const k of syms) { w[k] = s.n[k] * px[k]; total += w[k]; }
  for (const k of syms) w[k] /= total;
  let mx = syms[0], mn = syms[0];
  for (const k of syms) { if (w[k] > w[mx]) mx = k; if (w[k] < w[mn]) mn = k; }
  if (w[mx] - w[mn] >= p.minPairGap) {
    const d = p.transferFraction * (w[mx] - w[mn]);
    w[mx] -= d; w[mn] += d;
  }
  for (const k of syms) s.n[k] = w[k] * total / px[k];
  return w;
}
