// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-causal-zigzag). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-causal-zigzag",
  "name": "Does a confirmed ZigZag reversal work on crypto?",
  "family": "event-price-zigzag",
  "source": "retail trading content: non repainting ZigZag directional change crypto strategy",
  "assetClass": "crypto",
  "timeframe": "1h",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT"
  ],
  "longShort": false,
  "params": {
    "reversalPct": 0.03,
    "maxHoldHours": 168,
    "warmupBars": 168
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const c = bars[i].close;
  if (st.pos === undefined) { st.pos = 0; st.dir = 0; st.hi = c; st.lo = c; st.ext = c; st.entry = -1; }
  const r = ctx.params.reversalPct;
  let up = false, dn = false;
  if (st.dir === 0) {
    if (c > st.hi) st.hi = c;
    if (c < st.lo) st.lo = c;
    if (c <= (1 - r) * st.hi) { st.dir = -1; st.ext = c; }
    else if (c >= (1 + r) * st.lo) { st.dir = 1; st.ext = c; }
  } else if (st.dir === -1) {
    if (c < st.ext) st.ext = c;
    if (c >= (1 + r) * st.ext) { st.dir = 1; st.ext = c; up = true; }
  } else {
    if (c > st.ext) st.ext = c;
    if (c <= (1 - r) * st.ext) { st.dir = -1; st.ext = c; dn = true; }
  }
  if (i < ctx.params.warmupBars) return 0;
  if (st.pos === 1) {
    if (dn || i - st.entry >= ctx.params.maxHoldHours) { st.pos = 0; return 0; }
    return 1;
  }
  if (up) { st.pos = 1; st.entry = i; return 1; }
  return 0;
}
