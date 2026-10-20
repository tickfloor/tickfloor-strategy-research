// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-tail-loss-sizing). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-tail-loss-sizing",
  "name": "Does sizing crypto by its worst daily losses work?",
  "family": "tail-budget",
  "source": "retail trading content: expected shortfall position sizing crypto portfolio versus equal weight",
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
  "rebalance": "weekly",
  "longShort": false,
  "params": {
    "warmupBars": 127,
    "returnWindow": 126,
    "tailCount": 13,
    "riskFloor": 0.005,
    "equalWeightMix": 0.5
  }
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = [], risk = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < p.warmupBars) continue;
    let ok = true;
    for (let k = n - p.returnWindow - 1; k < n; k++) if (!(Number.isFinite(b[k].close) && b[k].close > 0)) { ok = false; break; }
    if (!ok) continue;
    const r = [];
    for (let k = n - p.returnWindow; k < n; k++) r.push(b[k].close / b[k - 1].close - 1);
    r.sort((x, y) => x - y);
    let m = 0;
    for (let k = 0; k < p.tailCount; k++) m += r[k];
    m /= p.tailCount;
    syms.push(sym); risk.push(Math.max(p.riskFloor, -m));
  }
  const N = syms.length;
  if (N === 0) return {};
  const a = risk.map((x) => 1 / x);
  const sa = a.reduce((x, y) => x + y, 0);
  const w = {};
  for (let k = 0; k < N; k++) w[syms[k]] = p.equalWeightMix / N + (1 - p.equalWeightMix) * a[k] / sa;
  return w;
}
