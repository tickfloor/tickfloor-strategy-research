// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-15). Edwards & Magee (1948) 'support becomes resistance'; break-and-retest.
// Clarified in prereg: retest tests the latest breakout recorded on bars before i; bar i may then register as a new breakout.
export const meta = {
  id: "c1023-pop-15",
  name: "Breakout and retest: buy the first pullback to a broken 50-day high within 15 bars, stop 3% under the level",
  family: "momentum",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { level: 50, retestWindow: 15, touchPct: 0.02, stopPct: 0.03, maxBars: 20 },
};

function hiOf(bars, a, b) {
  if (a < 0) return NaN;
  let m = -Infinity;
  for (let k = a; k <= b; k++) if (bars[k].high > m) m = bars[k].high;
  return m;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.L = null; st.j = -1; st.entL = NaN; st.at = 0; }
  const b = bars[i];
  let next = st.pos;
  if (st.pos === 1) {
    if (b.close < (1 - p.stopPct) * st.entL || i - st.at >= p.maxBars) next = 0;
  } else if (st.L !== null && i > st.j && i <= st.j + p.retestWindow &&
             b.low <= (1 + p.touchPct) * st.L && b.close > st.L && b.close > b.open) {
    // One trade per breakout: the entry consumes the breakout level.
    next = 1;
    st.entL = st.L;
    st.at = i;
    st.L = null;
  }
  // Register bar i as the latest breakout (after the retest test).
  const L = hiOf(bars, i - p.level, i - 1);
  if (b.close > L) {
    st.L = L;
    st.j = i;
  }
  st.pos = next;
  return next;
}
