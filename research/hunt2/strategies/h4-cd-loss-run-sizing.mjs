// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-loss-run-sizing). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-loss-run-sizing",
  "name": "Does sizing down coins with clustered losing runs work?",
  "family": "tail-budget",
  "source": "retail trading content: consecutive loss run risk position sizing crypto equal weight comparison",
  "assetClass": "crypto",
  "timeframe": "1d",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT",
    "BCHUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "DASHUSDT",
    "ZECUSDT",
    "AVAXUSDT",
    "UNIUSDT",
    "NEARUSDT",
    "AAVEUSDT",
    "HBARUSDT"
  ],
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "returnWindow": 63,
    "riskFloor": 0.005,
    "equalWeightMix": 0.5
  },
  "rebalance": "weekly"
};

export function rank(universe, t, ctx) {
  const P = ctx.params, items = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym], n = b.length;
    if (n < P.warmupBars) continue;
    let ok = true;
    for (let k = n - P.warmupBars; k < n; k++) { const c = b[k].close; if (!(Number.isFinite(c) && c > 0)) { ok = false; break; } }
    if (!ok) continue;
    let run = 1, worst = 0;
    for (let k = n - P.returnWindow; k < n; k++) {
      const r = b[k].close / b[k - 1].close - 1;
      if (r < 0) { run *= 1 + r; worst = Math.max(worst, 1 - run); } else run = 1;
    }
    items.push([sym, 1 / Math.max(P.riskFloor, worst)]);
  }
  const w = {};
  if (!items.length) return w;
  let sa = 0;
  for (const [, a] of items) sa += a;
  for (const [sym, a] of items) w[sym] = P.equalWeightMix / items.length + (1 - P.equalWeightMix) * a / sa;
  return w;
}
