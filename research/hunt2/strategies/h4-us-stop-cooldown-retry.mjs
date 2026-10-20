// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-stop-cooldown-retry). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-stop-cooldown-retry",
  "name": "Does a short cooldown justify retrying a stopped stock trade?",
  "family": "stop-reentry",
  "source": "retail trading content: stop loss cooldown unconditional one retry trading policy",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "stopFraction": 0.04,
    "cashReturnsBeforeRetry": 3,
    "retryDeadlineBars": 15,
    "maxHoldBars": 20,
    "maxRetries": 1
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.legEntry = NaN; st.cycleStart = -1; st.stopIndex = -1; st.armed = false; st.retried = false; }
  const p = ctx.params;
  if (i < p.warmupBars) return 0;
  const c = bars[i].close;
  if ((i - p.warmupBars) % p.cycleBars === 0) {
    st.pos = 1; st.legEntry = c; st.cycleStart = i; st.armed = false; st.retried = false; st.stopIndex = -1;
    return 1;
  }
  if (st.cycleStart < 0) return 0;
  const age = i - st.cycleStart;
  if (st.pos === 1) {
    if (age >= p.maxHoldBars) { st.pos = 0; st.armed = false; return 0; }
    if (c <= (1 - p.stopFraction) * st.legEntry) {
      st.pos = 0;
      if (!st.retried) { st.armed = true; st.stopIndex = i; }
      return 0;
    }
    return 1;
  }
  if (st.armed && !st.retried && age < p.maxHoldBars && age <= p.retryDeadlineBars && i - st.stopIndex >= p.cashReturnsBeforeRetry) {
    st.pos = 1; st.legEntry = c; st.retried = true; st.armed = false;
    return 1;
  }
  return 0;
}
