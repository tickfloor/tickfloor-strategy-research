// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-chande-forecast). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-chande-forecast",
  "name": "Does the Chande Forecast Oscillator work on crypto?",
  "family": "indicator-forecast-oscillator",
  "source": "retail trading content: Chande Forecast Oscillator linear regression crypto strategy",
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
    "regressionHours": 48,
    "entryCfoPct": 0.25,
    "exitCfoPct": -0.25,
    "minimumHoldHours": 24,
    "maxHoldHours": 96,
    "emergencyStopPct": 0.05,
    "cooldownHours": 24,
    "warmupBars": 96
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.cool = 0; st.entry = -1; st.entryPx = 0; st.S = 0; st.T = 0; st.cfo = NaN; }
  const B = ctx.params, N = B.regressionHours;
  const c = bars[i].close;
  // O(1) window sums: S = sum y, T = sum k*y (k = position in window)
  let slope = NaN, cfo = NaN;
  if (i === N - 1) {
    st.S = 0; st.T = 0;
    for (let k = 0; k < N; k++) { st.S += bars[k].close; st.T += k * bars[k].close; }
  } else if (i >= N) {
    st.S += c - bars[i - N].close;
    st.T += (N * c) - st.S;
  }
  if (i >= N - 1) {
    const m = (N - 1) / 2, sxx = (N * (N * N - 1)) / 12;
    slope = (st.T - m * st.S) / sxx;
    cfo = (100 * (c - (ctx.sma("close", N, i) + (m + 1) * slope))) / c;
  }
  const prev = st.cfo; st.cfo = cfo;
  if (i < B.warmupBars) return 0;
  if (st.pos === 1) {
    const held = i - st.entry;
    if ((held >= B.minimumHoldHours && cfo <= B.exitCfoPct) || c <= (1 - B.emergencyStopPct) * st.entryPx || held >= B.maxHoldHours) {
      st.pos = 0; st.cool = B.cooldownHours; return 0;
    }
    return 1;
  }
  if (st.cool > 0) { st.cool--; return 0; }
  if (prev <= B.entryCfoPct && cfo > B.entryCfoPct && slope > 0) { st.pos = 1; st.entry = i; st.entryPx = c; return 1; }
  return 0;
}
