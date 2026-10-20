// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-bw-facilitation). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-bw-facilitation",
  "name": "Does Bill Williams' Market Facilitation Index work on crypto?",
  "family": "indicator-market-facilitation",
  "source": "https://www.metatrader4.com/en/trading-platform/help/analytics/tech_indicators/market_facilitation_index",
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
    "maxHoldHours": 72,
    "emergencyStopPct": 0.05,
    "cooldownHours": 24,
    "warmupBars": 48
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.cool = 0; st.entry = -1; st.entryPx = 0; }
  const B = ctx.params;
  if (i < B.warmupBars) return 0;
  const c = bars[i].close;
  if (st.pos === 1) {
    if (c <= (1 - B.emergencyStopPct) * st.entryPx || i - st.entry >= B.maxHoldHours) { st.pos = 0; st.cool = B.cooldownHours; return 0; }
    return 1;
  }
  if (st.cool > 0) { st.cool--; return 0; }
  const a = bars[i - 2], b = bars[i - 1], d = bars[i];
  if (a.volume <= 0 || b.volume <= 0 || d.volume <= 0 || a.high <= a.low || b.high <= b.low || d.high <= d.low) return 0;
  const fa = (a.high - a.low) / a.volume, fb = (b.high - b.low) / b.volume, fd = (d.high - d.low) / d.volume;
  if (b.volume > a.volume && fb < fa && d.volume > b.volume && fd > fb && c > b.close && c > d.open) { st.pos = 1; st.entry = i; st.entryPx = c; return 1; }
  return 0;
}
