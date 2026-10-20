// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-return-time-centroids). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-return-time-centroids",
  "name": "Does the ordering of crypto gains and losses matter?",
  "family": "path-order",
  "source": "retail trading content: temporal ordering of gains losses return centroids portfolio selection",
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
    "topN": 4
  },
  "rebalance": "weekly"
};

export function rank(universe, t, ctx) {
  const P = ctx.params, scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym], n = b.length;
    if (n < P.warmupBars) continue;
    let ok = true;
    for (let k = n - P.warmupBars; k < n; k++) { const c = b[k].close; if (!(Number.isFinite(c) && c > 0)) { ok = false; break; } }
    if (!ok) continue;
    let U = 0, D = 0, SU = 0, SD = 0;
    for (let j = 0; j < P.returnWindow; j++) {
      const k = n - P.returnWindow + j;
      const r = b[k].close / b[k - 1].close - 1;
      if (r > 0) { U += r; SU += j * r; } else if (r < 0) { D -= r; SD -= j * r; }
    }
    if (!(U > 0) || !(D > 0)) continue;
    scores.push([sym, (SU / U - SD / D) / (P.returnWindow - 1)]);
  }
  scores.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const top = scores.slice(0, Math.min(P.topN, scores.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}
