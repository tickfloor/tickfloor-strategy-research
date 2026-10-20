// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-tracking-debt-rebalancing). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-tracking-debt-rebalancing",
  "name": "Does accumulated allocation error give a better ETF reset rule?",
  "family": "rebalance-control",
  "source": "retail trading content: accumulated tracking error budget portfolio rebalancing",
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
    "errorDebtLimit": 0.01
  }
};

export function rank(universe, t, ctx) {
  const p = ctx.params, s = ctx.state, syms = ["QQQ", "TLT", "GLD", "SHY"];
  const px = {};
  for (const k of syms) {
    const b = universe[k];
    if (!b || b.length < p.warmupBars || !b.slice(-2).every((x) => Number.isFinite(x.close) && x.close > 0)) { s.init = false; return {}; }
    px[k] = b[b.length - 1].close;
  }
  const w = {};
  if (!s.init) {
    s.init = true; s.debt = 0; s.n = {};
    for (const k of syms) { s.n[k] = p.targetWeight / px[k]; w[k] = p.targetWeight; }
    return w;
  }
  let total = 0;
  for (const k of syms) { w[k] = s.n[k] * px[k]; total += w[k]; }
  let e = 0;
  for (const k of syms) { w[k] /= total; e += (w[k] - p.targetWeight) ** 2; }
  s.debt += e;
  if (s.debt >= p.errorDebtLimit) {
    for (const k of syms) { w[k] = p.targetWeight; s.n[k] = p.targetWeight * total / px[k]; }
    s.debt = 0;
  }
  return w;
}
