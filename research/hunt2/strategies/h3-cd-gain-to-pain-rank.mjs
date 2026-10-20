// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-gain-to-pain-rank). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-gain-to-pain-rank",
  "name": "Does ranking crypto by gain-to-pain beat chasing the biggest winners?",
  "family": "momentum-gain-pain",
  "source": "retail trading content: Jack Schwager gain to pain ratio crypto portfolio ranking",
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
    "returnWindow": 63,
    "topN": 4,
    "minScore": 0,
    "denominatorFloor": 1e-12,
    "warmupBars": 64
  },
  "rebalance": "weekly"
};

export function rank(universe, t, ctx) {
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < 64) continue;
    let gain = 0, pain = 0, ok = true;
    for (let k = n - 63; k < n; k++) {
      const p0 = b[k - 1].close, p1 = b[k].close;
      if (!(Number.isFinite(p0) && Number.isFinite(p1) && p0 > 0 && p1 > 0)) { ok = false; break; }
      const r = p1 / p0 - 1;
      gain += r;
      pain += Math.max(-r, 0);
    }
    if (!ok) continue;
    const sc = gain / Math.max(pain, 1e-12);
    if (!Number.isFinite(sc) || sc <= 0) continue;
    scores.push([sym, sc]);
  }
  scores.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = scores.slice(0, 4);
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}

