// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-williams-fractal-break). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-hourly-williams-fractal-break",
  "name": "Do confirmed Williams fractal breakouts work on crypto?",
  "family": "structure-fractals",
  "source": "https://www.metatrader5.com/en/terminal/help/indicators/bw_indicators/fractals",
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
    "fractalWingBars": 2,
    "maxFractalAgeHours": 72,
    "minimumHoldHours": 24,
    "maxHoldHours": 120,
    "emergencyStopPct": 0.05,
    "cooldownHours": 24,
    "warmupBars": 72
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.cool = 0; st.entry = -1; st.entryPx = 0; st.support = 0; st.up = null; st.lo = null; }
  const B = ctx.params;
  // fractals confirmed at this bar (visible only to later bars' entry check)
  let newUp = null, newLo = null;
  if (i >= 4) {
    const p = i - 2, h = bars[p].high, l = bars[p].low;
    if (h > bars[p - 2].high && h > bars[p - 1].high && h > bars[p + 1].high && h > bars[p + 2].high) newUp = { p, h, used: false };
    if (l < bars[p - 2].low && l < bars[p - 1].low && l < bars[p + 1].low && l < bars[p + 2].low) newLo = { p, l };
  }
  let out = 0;
  if (i >= B.warmupBars) {
    if (st.pos === 1) {
      if (newLo && newLo.l > st.support) st.support = newLo.l;
      const held = i - st.entry;
      if ((held >= B.minimumHoldHours && bars[i].close < st.support) || bars[i].close <= (1 - B.emergencyStopPct) * st.entryPx || held >= B.maxHoldHours) {
        st.pos = 0; st.cool = B.cooldownHours;
      } else out = 1;
    } else if (st.cool > 0) st.cool--;
    else {
      const u = st.up;
      if (u && !u.used && i - u.p <= B.maxFractalAgeHours && bars[i - 1].close <= u.h && bars[i].close > u.h) {
        u.used = true; st.pos = 1; st.entry = i; st.entryPx = bars[i].close;
        const lo = newLo || st.lo;
        st.support = lo ? lo.l : (1 - B.emergencyStopPct) * st.entryPx;
        out = 1;
      }
    }
  }
  if (newUp) st.up = newUp;
  if (newLo) st.lo = newLo;
  return out;
}
