// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-breakeven-lock). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-breakeven-lock",
  "name": "Does moving a stock exit to breakeven after a gain work?",
  "family": "profit-disposition",
  "source": "retail trading content: move stop to breakeven after four percent profit stock trade",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "armGain": 0.04,
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
    let exit = k >= p.maxHoldBars;
    if (!exit && st.armed && c <= st.entry) exit = true;
    if (!st.armed && c >= (1 + p.armGain) * st.entry) st.armed = true;
    if (exit) { st.pos = 0; return 0; }
    return 1;
  }
  if (sched) { st.pos = 1; st.entry = c; st.eIdx = i; st.armed = false; return 1; }
  return 0;
}
