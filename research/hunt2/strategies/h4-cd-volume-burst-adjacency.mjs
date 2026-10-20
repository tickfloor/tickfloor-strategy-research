// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-volume-burst-adjacency). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-volume-burst-adjacency",
  "name": "Do clustered volume bursts predict crypto returns?",
  "family": "volume-order",
  "source": "retail trading content: clustered volume bursts versus isolated volume spikes crypto",
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
    "decisionSpacingBars": 14,
    "volumeWindow": 20,
    "quantile": 0.75,
    "minAdjacentPairs": 3,
    "holdBars": 7
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryIdx = -1; }
  if (i < p.warmupBars) return 0;
  if (s.pos === 1) {
    if (i - s.entryIdx >= p.holdBars) { s.pos = 0; } else return 1;
  }
  if ((i - p.warmupBars) % p.decisionSpacingBars !== 0) return 0;
  const v = [];
  let sum = 0;
  for (let k = i - p.volumeWindow; k <= i - 1; k++) {
    const x = bars[k].volume;
    if (!Number.isFinite(x) || x < 0) return 0;
    v.push(x); sum += x;
  }
  if (!(sum > 0)) return 0;
  const q = v.slice().sort((a, b) => a - b)[14];
  let pairs = 0;
  for (let k = 1; k < v.length; k++) if (v[k - 1] > q && v[k] > q) pairs++;
  if (pairs >= p.minAdjacentPairs) { s.pos = 1; s.entryIdx = i; return 1; }
  return 0;
}
