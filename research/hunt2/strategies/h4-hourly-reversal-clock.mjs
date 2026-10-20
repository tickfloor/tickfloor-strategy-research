// Spec: docs/research/hunt-1004/codex/specs.json (h4-hourly-reversal-clock). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-hourly-reversal-clock",
  "name": "Does counting direction changes improve crypto exits?",
  "family": "event-clock",
  "source": "retail trading content: direction change count event clock trade exits",
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
    "warmupBars": 240,
    "cycleBars": 240,
    "reversalLimit": 24,
    "maxHoldBars": 192
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = -1; st.lastSign = 0; st.rev = 0; }
  const P = ctx.params;
  if (i < P.warmupBars) return 0;
  if (st.pos === 1) {
    const s = Math.sign(bars[i].close - bars[i - 1].close);
    if (s !== 0) { if (st.lastSign !== 0 && st.lastSign !== s) st.rev++; st.lastSign = s; }
    if (st.rev >= P.reversalLimit || i - st.entry >= P.maxHoldBars) { st.pos = 0; return 0; }
    return 1;
  }
  if ((i - P.warmupBars) % P.cycleBars === 0) { st.pos = 1; st.entry = i; st.lastSign = 0; st.rev = 0; return 1; }
  return 0;
}
