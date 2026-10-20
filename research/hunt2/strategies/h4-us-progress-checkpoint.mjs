// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-progress-checkpoint). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-progress-checkpoint",
  "name": "Does a five-day progress check improve stock exits?",
  "family": "holding-clock",
  "source": "retail trading content: time stop trade not working five day checkpoint",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "checkpointBars": 5,
    "maxHoldBars": 20
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = -1; st.entryPx = 0; }
  const P = ctx.params;
  if (i < P.warmupBars) return 0;
  if (st.pos === 1) {
    const age = i - st.entry;
    if (age >= P.maxHoldBars || (age === P.checkpointBars && bars[i].close <= st.entryPx)) { st.pos = 0; return 0; }
    return 1;
  }
  if ((i - P.warmupBars) % P.cycleBars === 0) { st.pos = 1; st.entry = i; st.entryPx = bars[i].close; return 1; }
  return 0;
}
