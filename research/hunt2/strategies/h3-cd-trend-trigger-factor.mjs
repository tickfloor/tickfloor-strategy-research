// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-trend-trigger-factor). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-trend-trigger-factor",
  "name": "Does the Trend Trigger Factor work on crypto?",
  "family": "indicator-trend-trigger",
  "source": "retail trading content: Trend Trigger Factor 15 period 100 threshold crypto strategy",
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
    "halfWindow": 15,
    "entryLevel": 100,
    "exitLevel": 0,
    "maxHoldBars": 45,
    "warmupBars": 40
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = -1; st.prev = NaN; }
  let ttf = NaN;
  if (i >= 29) {
    const r = ctx.donchian(15, i), p = ctx.donchian(15, i - 15);
    const b = r.upper - p.lower, s = p.upper - r.lower, d = 0.5 * (b + s);
    ttf = d <= 0 ? 0 : (100 * (b - s)) / d;
  }
  const prev = st.prev; st.prev = ttf;
  if (i < ctx.params.warmupBars) return 0;
  if (st.pos === 1) {
    if (ttf < ctx.params.exitLevel || i - st.entry >= ctx.params.maxHoldBars) { st.pos = 0; return 0; }
    return 1;
  }
  if (prev <= ctx.params.entryLevel && ttf > ctx.params.entryLevel) { st.pos = 1; st.entry = i; return 1; }
  return 0;
}
