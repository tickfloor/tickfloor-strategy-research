// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-joint-tail-sizing). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-joint-tail-sizing",
  "name": "Does sizing ETFs by their losses on shared bad days work?",
  "family": "tail-budget",
  "source": "retail trading content: co expected shortfall portfolio tail contribution ETF sizing",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "XLF",
    "XLY",
    "TLT",
    "AGG",
    "GLD",
    "SHY"
  ],
  "rebalance": "weekly",
  "longShort": false,
  "params": {
    "warmupBars": 127,
    "returnWindow": 126,
    "marketTailDays": 13,
    "riskFloor": 0.001,
    "equalWeightMix": 0.5
  }
};

export function rank(universe, t, ctx) {
  const p = ctx.params, syms = ["QQQ", "DIA", "XLF", "XLY", "TLT", "AGG", "GLD", "SHY"], N = syms.length, n = p.warmupBars;
  for (const k of syms) {
    const b = universe[k];
    if (!b || b.length < n) return {};
    for (let j = b.length - n; j < b.length; j++) if (!(Number.isFinite(b[j].close) && b[j].close > 0)) return {};
  }
  for (let j = 1; j <= n; j++) {
    const t0 = universe[syms[0]][universe[syms[0]].length - j].time;
    for (const k of syms) if (universe[k][universe[k].length - j].time !== t0) return {};
  }
  const R = p.returnWindow, rets = {};
  for (const k of syms) {
    const b = universe[k], r = [];
    for (let j = b.length - R; j < b.length; j++) r.push(b[j].close / b[j - 1].close - 1);
    rets[k] = r;
  }
  const bask = [];
  for (let d = 0; d < R; d++) { let m = 0; for (const k of syms) m += rets[k][d]; bask.push(m / N); }
  const idx = bask.map((_, d) => d).sort((x, y) => bask[x] - bask[y] || x - y).slice(0, p.marketTailDays);
  const a = {}; let sa = 0;
  for (const k of syms) {
    let m = 0; for (const d of idx) m += rets[k][d];
    m /= idx.length;
    a[k] = 1 / Math.max(p.riskFloor, -m); sa += a[k];
  }
  const w = {};
  for (const k of syms) w[k] = p.equalWeightMix / N + (1 - p.equalWeightMix) * a[k] / sa;
  return w;
}
