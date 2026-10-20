// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-winner-stall). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-winner-stall",
  "name": "Does selling a stalled crypto winner work?",
  "family": "holding-clock",
  "source": "retail trading content: time since maximum favorable excursion stalled winner exit",
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
    "armGain": 0.1,
    "staleBars": 5
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryIdx = -1; s.entry = 0; s.best = 0; s.lastImp = -1; s.armed = false; }
  if (i < p.warmupBars) return 0;
  if (s.pos === 1) {
    const c = bars[i].close;
    if (c > s.best) { s.best = c; s.lastImp = i; }
    if (s.best >= (1 + p.armGain) * s.entry) s.armed = true;
    if (i - s.entryIdx >= p.maxHoldBars || (s.armed && i - s.lastImp >= p.staleBars)) { s.pos = 0; return 0; }
    return 1;
  }
  if ((i - p.warmupBars) % p.cycleBars === 0) {
    s.pos = 1; s.entryIdx = i; s.entry = bars[i].close; s.best = s.entry; s.lastImp = i; s.armed = false; return 1;
  }
  return 0;
}
