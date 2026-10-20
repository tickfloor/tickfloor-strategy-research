// Spec: docs/research/hunt-1004/codex/specs.json (h4-hourly-volume-migration). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-hourly-volume-migration",
  "name": "Does volume arriving later in the crypto day predict returns?",
  "family": "volume-order",
  "source": "retail trading content: late session volume centroid migration cryptocurrency accumulation",
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
    "warmupBars": 192,
    "historyDays": 7,
    "minCentroidShiftHours": 3,
    "maxAbsDayReturn": 0.01,
    "holdBars": 24
  }
};

// true when bars[i-23..i] are 24 consecutive hourly bars starting at UTC 00:00 within one day
function completeDay(bars, i) {
  if (i < 23) return false;
  const t0 = bars[i - 23].time;
  if (t0 % 86400 !== 0) return false;
  for (let k = 0; k < 24; k++) if (bars[i - 23 + k].time !== t0 + 3600 * k) return false;
  return true;
}

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = -1; st.hist = []; st.lastDay = -1; }
  const B = ctx.params;
  const warm = i < B.warmupBars; // Astra audit (hunt-1004): history is collected through the warm-up; only entries are suppressed before warmupBars
  const isEnd = Math.floor(bars[i].time / 3600) % 24 === 23;
  let exiting = false;
  if (st.pos === 1) {
    if (i - st.entry >= 24) { st.pos = 0; exiting = true; } else return 1;
  }
  if (!isEnd) return 0;
  const day = Math.floor(bars[i].time / 86400);
  let rec = null;
  if (completeDay(bars, i)) {
    let V = 0, S = 0, ok = true;
    for (let h = 0; h < 24; h++) {
      const v = bars[i - 23 + h].volume;
      if (!(Number.isFinite(v) && v >= 0)) { ok = false; break; }
      V += v; S += h * v;
    }
    if (ok && V > 0) rec = { V, T: S / V };
  }
  if (st.lastDay !== -1 && day - st.lastDay !== 1) st.hist = [];
  st.lastDay = day;
  if (!rec) { st.hist = []; return 0; }
  let enter = false;
  if (st.hist.length >= B.historyDays) {
    let mV = 0, mT = 0;
    for (const r of st.hist) { mV += r.V; mT += r.T; }
    mV /= st.hist.length; mT /= st.hist.length;
    const move = Math.abs(bars[i].close / bars[i - 23].open - 1);
    enter = rec.T - mT >= B.minCentroidShiftHours && rec.V > mV && move <= B.maxAbsDayReturn;
  }
  st.hist.push(rec);
  if (st.hist.length > B.historyDays) st.hist.shift();
  if (enter && !exiting && !warm) { st.pos = 1; st.entry = i; return 1; }
  return 0;
}
