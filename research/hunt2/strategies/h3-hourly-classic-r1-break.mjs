// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-classic-r1-break). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-classic-r1-break",
  "name": "Does breaking yesterday's R1 pivot work on crypto?",
  "family": "pivot-momentum",
  "source": "retail trading content: classic pivot point R1 breakout crypto trading strategy",
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
    "utcDayHours": 24,
    "maxHoldHours": 72,
    "cooldownHours": 24,
    "warmupBars": 48
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.cool = 0; st.entry = -1; st.day = -1; st.n = 0; st.first = 0; st.h = 0; st.l = 0; st.last = 0; st.P = NaN; st.R1 = NaN; st.tradedDay = -1; }
  const B = ctx.params;
  const b = bars[i], d = Math.floor(b.time / 86400);
  if (d !== st.day) {
    const ok = st.day >= 0 && d === st.day + 1 && st.n === 24 && st.first % 86400 === 0 && st.last === st.first + 23 * 3600;
    if (ok) { st.P = (st.h + st.l + st.lastClose) / 3; st.R1 = 2 * st.P - st.l; } else { st.P = NaN; st.R1 = NaN; }
    st.day = d; st.n = 0; st.first = b.time; st.h = b.high; st.l = b.low;
  }
  st.n++; st.last = b.time; st.lastClose = b.close;
  if (b.high > st.h) st.h = b.high;
  if (b.low < st.l) st.l = b.low;
  if (i < B.warmupBars) return 0;
  if (st.pos === 1) {
    if (b.close < st.entryP || i - st.entry >= B.maxHoldHours) { st.pos = 0; st.cool = B.cooldownHours; return 0; }
    return 1;
  }
  if (st.cool > 0) { st.cool--; return 0; }
  if (st.R1 === st.R1 && st.tradedDay !== d && bars[i - 1].close <= st.R1 && b.close > st.R1) {
    st.pos = 1; st.entry = i; st.entryP = st.P; st.tradedDay = d; return 1;
  }
  return 0;
}
