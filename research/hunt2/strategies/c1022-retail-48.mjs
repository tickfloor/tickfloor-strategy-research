// c1022 retail spec 48 (campaign-1022/prereg-retail.json, frozen before code).
// Ascending triangle: flat top R (touches within 1%), rising fractal lows across gaps between touches.
// Reading used: "last fractal low" = the most recent fractal low inside the pattern.
export const meta = {
  id: "c1022-retail-48",
  name: "Ascending triangle breakout (Bulkowski)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { window: 40, touchTol: 0.01, minTouches: 3, minSpacing: 5, maxHold: 30 },
};

// fractal low at k, needs bars k-2..k+2 (caller guarantees k <= i-3)
function isFractalLow(bars, k) {
  const l = bars[k].low;
  return l < bars[k - 1].low && l < bars[k - 2].low && l < bars[k + 1].low && l < bars[k + 2].low;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.lastLow = NaN; st.target = NaN; }

  if (st.pos === 1) {
    st.held++;
    const c = bars[i].close;
    if (c >= st.target || c < st.lastLow || st.held >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (i < p.window + 3) return 0;

  // resistance R = max high over bars i-window .. i-1 (bar i excluded)
  const w0 = i - p.window;
  let R = -Infinity;
  for (let j = w0; j < i; j++) if (bars[j].high > R) R = bars[j].high;
  for (let j = w0; j < i; j++) if (bars[j].close > R) return 0;

  // touches: high within touchTol of R, counted only if >= minSpacing bars after the previous counted touch
  const touches = [];
  for (let j = w0; j < i; j++) {
    if (bars[j].high >= R * (1 - p.touchTol)) {
      if (touches.length === 0 || j - touches[touches.length - 1] >= p.minSpacing) touches.push(j);
    }
  }
  if (touches.length < p.minTouches) return 0;

  // every gap between consecutive touches needs a fractal low; each gap's lowest must be above the previous gap's
  let prevGapLow = -Infinity, lowestAll = Infinity, lastLow = NaN, ok = true;
  for (let a = 0; a + 1 < touches.length && ok; a++) {
    let gapLow = Infinity;
    for (let k = touches[a] + 1; k < touches[a + 1]; k++) {
      if (k > i - 3 || k < 2) continue;
      if (isFractalLow(bars, k)) {
        gapLow = Math.min(gapLow, bars[k].low);
        lastLow = bars[k].low;
      }
    }
    if (gapLow === Infinity || gapLow <= prevGapLow) ok = false;
    prevGapLow = gapLow;
    lowestAll = Math.min(lowestAll, gapLow);
  }
  if (!ok || !Number.isFinite(lastLow)) return 0;

  if (bars[i].close > R) {
    st.pos = 1; st.held = 0; st.lastLow = lastLow; st.target = R + (R - lowestAll);
    return 1;
  }
  return 0;
}
