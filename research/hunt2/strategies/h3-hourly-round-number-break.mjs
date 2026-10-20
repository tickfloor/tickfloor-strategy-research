// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-round-number-break). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-round-number-break",
  "name": "Do psychological round-number breakouts work on crypto?",
  "family": "psychological-price-levels",
  "source": "retail trading content: Bitcoin round number psychological resistance breakout strategy",
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
    "decimalStepExponentOffset": -1,
    "approachHours": 6,
    "approachAtrDistance": 0.3,
    "breakoutAtrBuffer": 0.2,
    "failedBreakAtrBuffer": 0.5,
    "atrBars": 24,
    "minimumHoldHours": 24,
    "maxHoldHours": 72,
    "emergencyStopPct": 0.05,
    "cooldownHours": 24,
    "warmupBars": 48
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.cool = 0; st.entry = -1; st.entryPx = 0; st.entryAtr = 0; st.R = 0; }
  const B = ctx.params;
  if (i < B.warmupBars) return 0;
  const c = bars[i].close;
  if (st.pos === 1) {
    const held = i - st.entry;
    if ((held >= B.minimumHoldHours && c < st.R - B.failedBreakAtrBuffer * st.entryAtr) || c <= (1 - B.emergencyStopPct) * st.entryPx || held >= B.maxHoldHours) {
      st.pos = 0; st.cool = B.cooldownHours; return 0;
    }
    return 1;
  }
  if (st.cool > 0) { st.cool--; return 0; }
  const atr = ctx.atr(B.atrBars, i), atrPrev = ctx.atr(B.atrBars, i - 1);
  if (!(atr === atr) || !(atrPrev === atrPrev)) return 0;
  const P = bars[i - 1].close;
  const step = Math.pow(10, Math.floor(Math.log10(P)) + B.decimalStepExponentOffset);
  const R = (Math.floor(P / step) + 1) * step;
  let near = false;
  for (let k = i - B.approachHours; k < i; k++) {
    const x = bars[k].close;
    if (x >= R) return 0;
    if (R - x <= B.approachAtrDistance * atrPrev) near = true;
  }
  if (near && c > R + B.breakoutAtrBuffer * atr) { st.pos = 1; st.entry = i; st.entryPx = c; st.entryAtr = atr; st.R = R; return 1; }
  return 0;
}
