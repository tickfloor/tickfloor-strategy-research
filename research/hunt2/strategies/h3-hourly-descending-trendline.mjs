// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-descending-trendline). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-descending-trendline",
  "name": "Does breaking a descending trendline work on crypto?",
  "family": "structure-trendlines",
  "source": "retail trading content: confirmed pivot descending trendline breakout crypto strategy",
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
    "pivotWingBars": 2,
    "minPivotSeparationHours": 6,
    "maxPivotSeparationHours": 48,
    "maxSecondPivotAgeHours": 72,
    "atrBars": 24,
    "breakoutAtrBuffer": 0.25,
    "stopAtr": 3,
    "maxHoldHours": 96,
    "cooldownHours": 24,
    "warmupBars": 96
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.cool = 0; st.entry = -1; st.entryAtr = 0; st.entryPx = 0; st.pa = null; st.pb = null; st.pair = null; }
  const B = ctx.params;
  // confirm pivot high at i-2 BEFORE the entry check, so the entry uses the latest confirmed pair (Astra audit fix, hunt-1003)
  if (i >= 4) {
    const p = i - 2, h = bars[p].high;
    if (h > bars[p - 2].high && h > bars[p - 1].high && h > bars[p + 1].high && h > bars[p + 2].high) {
      st.pa = st.pb; st.pb = { p, h };
      const a = st.pa, b = st.pb;
      st.pair = a && b.p - a.p >= B.minPivotSeparationHours && b.p - a.p <= B.maxPivotSeparationHours && b.h < a.h
        ? { p1: a.p, H1: a.h, p2: b.p, H2: b.h, used: false } : null;
    }
  }
  let out = 0;
  if (i >= B.warmupBars) {
    const atr = ctx.atr(B.atrBars, i);
    if (st.pos === 1) {
      if (bars[i].close <= st.entryPx - B.stopAtr * st.entryAtr || i - st.entry >= B.maxHoldHours) { st.pos = 0; st.cool = B.cooldownHours; }
      else out = 1;
    } else if (st.cool > 0) st.cool--;
    else {
      const pr = st.pair;
      const atrPrev = ctx.atr(B.atrBars, i - 1);
      if (pr && !pr.used && i > pr.p2 + 2 && i - pr.p2 <= B.maxSecondPivotAgeHours && atr === atr && atrPrev === atrPrev) {
        const slope = (pr.H2 - pr.H1) / (pr.p2 - pr.p1);
        const L = (k) => pr.H2 + slope * (k - pr.p2);
        const buf = B.breakoutAtrBuffer;
        if (bars[i - 1].close <= L(i - 1) + buf * atrPrev && bars[i].close > L(i) + buf * atr) {
          pr.used = true; st.pos = 1; st.entry = i; st.entryPx = bars[i].close; st.entryAtr = atr; out = 1;
        }
      }
    }
  }
  return out;
}
