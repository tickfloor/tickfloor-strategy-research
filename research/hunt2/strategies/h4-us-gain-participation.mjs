// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-gain-participation). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-gain-participation",
  "name": "Does giving back accumulated gains identify a bad stock hold?",
  "family": "profit-disposition",
  "source": "retail trading content: exit trade cumulative gains losses participation giveback",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "minPositiveSum": 0.04,
    "maxLossGainRatio": 0.6,
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
    const r = c / bars[i - 1].close - 1;
    st.U += Math.max(r, 0); st.D += Math.max(-r, 0);
    if (k >= p.maxHoldBars || (st.U >= p.minPositiveSum && st.D >= p.maxLossGainRatio * st.U)) { st.pos = 0; return 0; }
    return 1;
  }
  if (sched) { st.pos = 1; st.entry = c; st.eIdx = i; st.U = 0; st.D = 0; return 1; }
  return 0;
}
