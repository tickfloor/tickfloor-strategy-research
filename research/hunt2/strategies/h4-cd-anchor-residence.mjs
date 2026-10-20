// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-anchor-residence). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-anchor-residence",
  "name": "Does reclaiming a price after spending most of a month below it work?",
  "family": "anchor-occupation",
  "source": "retail trading content: price occupation time historical anchor reclaim",
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
    "anchorLagBars": 20,
    "minBelowCloses": 15,
    "reclaimCeiling": 0.03,
    "holdBars": 7,
    "cashBars": 7
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryIdx = -1; s.exitIdx = -1e9; }
  if (i < p.warmupBars) return 0;
  if (s.pos === 1) {
    if (i - s.entryIdx >= p.holdBars) { s.pos = 0; s.exitIdx = i; return 0; }
    return 1;
  }
  if (i - s.exitIdx < p.cashBars) return 0;
  const A = bars[i - p.anchorLagBars].close;
  let below = 0;
  for (let k = i - p.anchorLagBars + 1; k <= i - 1; k++) if (bars[k].close < A) below++;
  const c = bars[i].close;
  if (below >= p.minBelowCloses && bars[i - 1].close <= A && c > A && c <= (1 + p.reclaimCeiling) * A) {
    s.pos = 1; s.entryIdx = i; return 1;
  }
  return 0;
}
