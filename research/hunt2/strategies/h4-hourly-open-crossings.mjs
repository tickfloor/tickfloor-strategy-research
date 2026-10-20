// Spec: docs/research/hunt-1004/codex/specs.json (h4-hourly-open-crossings). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-hourly-open-crossings",
  "name": "Do repeated crossings of the crypto day's opening price work?",
  "family": "anchor-occupation",
  "source": "retail trading content: daily opening price crossing count next day crypto strategy",
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
    "minCrossings": 6,
    "minClosingGain": 0.005,
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
  if (i < B.warmupBars) return 0;
  const isEnd = Math.floor(bars[i].time / 3600) % 24 === 23;
  let exiting = false;
  if (st.pos === 1) {
    if (i - st.entry >= 24) { st.pos = 0; exiting = true; } else return 1;
  }
  if (!isEnd || exiting || !completeDay(bars, i)) return 0;
  const anchor = bars[i - 23].open;
  let last = 0, cross = 0;
  for (let k = i - 23; k <= i; k++) {
    const s = Math.sign(bars[k].close - anchor);
    if (s === 0) continue;
    if (last !== 0 && s !== last) cross++;
    last = s;
  }
  if (cross >= B.minCrossings && bars[i].close >= (1 + B.minClosingGain) * anchor) { st.pos = 1; st.entry = i; return 1; }
  return 0;
}
