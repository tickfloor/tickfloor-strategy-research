// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-adverse-path-budget). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-adverse-path-budget",
  "name": "Does a budget for all losing steps improve stock exits?",
  "family": "event-clock",
  "source": "retail trading content: cumulative adverse return loss budget trade exit",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "adverseBudget": 0.05,
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
    st.adverse += Math.max(0, 1 - c / bars[i - 1].close);
    if (k >= p.maxHoldBars || st.adverse >= p.adverseBudget) { st.pos = 0; return 0; }
    return 1;
  }
  if (sched) { st.pos = 1; st.entry = c; st.eIdx = i; st.adverse = 0; return 1; }
  return 0;
}
