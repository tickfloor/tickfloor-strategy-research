// Spec: docs/research/hunt-1004/codex/specs.json (h4-hourly-volume-clock). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-hourly-volume-clock",
  "name": "Does a volume clock improve hourly crypto exits?",
  "family": "event-clock",
  "source": "retail trading content: volume clock holding period neutral entry crypto",
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
    "volumeBaselineBars": 48,
    "volumeUnits": 72,
    "maxHoldBars": 192
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = -1; st.spent = 0; st.B = 0; }
  const P = ctx.params;
  if (i < P.warmupBars) return 0;
  if (st.pos === 1) {
    st.spent += bars[i].volume;
    if (st.spent >= P.volumeUnits * st.B || i - st.entry >= P.maxHoldBars) { st.pos = 0; return 0; }
    return 1;
  }
  if ((i - P.warmupBars) % P.cycleBars === 0) {
    const B = ctx.sma("volume", P.volumeBaselineBars, i - 1);
    if (Number.isFinite(B) && B > 0) { st.pos = 1; st.entry = i; st.spent = 0; st.B = B; return 1; }
  }
  return 0;
}
