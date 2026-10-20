// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-discount-entry). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-discount-entry",
  "name": "Does buying crypto well below its yearly high work?",
  "family": "underwater-entry",
  "source": "retail trading content: buy cryptocurrency twenty percent below 52 week high",
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
    "warmupBars": 366,
    "highWindow": 365,
    "entryDrawdown": 0.2,
    "recoveryDrawdown": 0.1,
    "maxHoldBars": 21,
    "cashBars": 7
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryIdx = -1; s.exitIdx = -1e9; s.armed = true; s.peak = 0; }
  if (i < p.warmupBars) return 0;
  const c = bars[i].close;
  if (s.pos === 1) {
    if (c >= (1 - p.recoveryDrawdown) * s.peak || i - s.entryIdx >= p.maxHoldBars) { s.pos = 0; s.exitIdx = i; return 0; }
    return 1;
  }
  let H = -Infinity;
  for (let k = i - p.highWindow; k <= i - 1; k++) if (bars[k].close > H) H = bars[k].close;
  const d = 1 - c / H;
  if (d < p.entryDrawdown) { s.armed = true; return 0; }
  if (i - s.exitIdx >= p.cashBars && s.armed) { s.armed = false; s.pos = 1; s.entryIdx = i; s.peak = H; return 1; }
  return 0;
}
