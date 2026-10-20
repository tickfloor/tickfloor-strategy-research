// Spec: docs/research/hunt-1004/codex/specs.json (h4-cd-original-entry-retry). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-cd-original-entry-retry",
  "name": "Does reclaiming the original entry justify buying crypto back?",
  "family": "stop-reentry",
  "source": "retail trading content: stopped out buy back original entry reclaim",
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
    "cycleBars": 40,
    "stopFraction": 0.08,
    "reentryDeadlineBars": 20,
    "maxHoldBars": 30,
    "maxReentries": 1
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.start = -1; s.orig = 0; s.leg = 0; s.disabled = true; s.retryArmed = false; s.retried = false; }
  if (i < p.warmupBars) return 0;
  const c = bars[i].close;
  if ((i - p.warmupBars) % p.cycleBars === 0) {
    s.pos = 1; s.start = i; s.orig = c; s.leg = c; s.disabled = false; s.retryArmed = false; s.retried = false; return 1;
  }
  if (s.disabled) return 0;
  const age = i - s.start;
  if (s.pos === 1) {
    if (age >= p.maxHoldBars) { s.pos = 0; s.disabled = true; return 0; }
    if (c <= (1 - p.stopFraction) * s.leg) {
      s.pos = 0;
      if (s.retried) s.disabled = true; else s.retryArmed = true;
      return 0;
    }
    return 1;
  }
  if (age >= p.maxHoldBars) { s.disabled = true; return 0; }
  if (s.retryArmed && age <= p.reentryDeadlineBars && bars[i - 1].close <= s.orig && c > s.orig) {
    s.pos = 1; s.leg = c; s.retryArmed = false; s.retried = true; return 1;
  }
  return 0;
}
