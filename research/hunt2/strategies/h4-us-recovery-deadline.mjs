// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-recovery-deadline). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-recovery-deadline",
  "name": "Does a deadline to recover an early loss improve stock exits?",
  "family": "holding-clock",
  "source": "retail trading content: trade stop probation recover entry price deadline",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "lossArmFraction": 0.02,
    "recoveryBars": 5,
    "maxHoldBars": 20
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = NaN; st.eIdx = -1; }
  const p = ctx.params;
  if (i < p.warmupBars) return 0;
  const c = bars[i].close;
  const sched = (i - p.warmupBars) % p.cycleBars === 0;
  if (st.pos === 1) {
    const k = i - st.eIdx;
    let exit = false;
    if (k >= p.maxHoldBars) exit = true;
    else if (st.pStart === null && !st.consumed) {
      if (c <= (1 - p.lossArmFraction) * st.entry) { st.pStart = i; st.consumed = true; }
    } else if (st.pStart !== null) {
      if (c >= st.entry) st.pStart = null;
      else if (i - st.pStart >= p.recoveryBars) exit = true;
    }
    if (exit) { st.pos = 0; return 0; }
    return 1;
  }
  if (sched) { st.pos = 1; st.entry = c; st.eIdx = i; st.pStart = null; st.consumed = false; return 1; }
  return 0;
}
