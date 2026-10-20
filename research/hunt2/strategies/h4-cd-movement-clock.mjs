// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-movement-clock). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-movement-clock",
  "name": "Does a movement budget improve crypto exits?",
  "family": "event-clock",
  "source": "retail trading content: cumulative absolute return event time trade exit",
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
    "cycleBars": 30,
    "maxHoldBars": 25,
    "movementBudget": 0.35
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryIdx = -1; s.movement = 0; }
  if (i < p.warmupBars) return 0;
  if (s.pos === 1) {
    s.movement += Math.abs(bars[i].close / bars[i - 1].close - 1);
    if (i - s.entryIdx >= p.maxHoldBars || s.movement >= p.movementBudget) { s.pos = 0; return 0; }
    return 1;
  }
  if ((i - p.warmupBars) % p.cycleBars === 0) { s.pos = 1; s.entryIdx = i; s.movement = 0; return 1; }
  return 0;
}
