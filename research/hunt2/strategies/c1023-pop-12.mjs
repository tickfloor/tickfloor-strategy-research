// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-12). Curtis Faith, Way of the Turtle (2007), ch. 5 (System 1 winning-trade filter).
// Clarified in prereg: one hypothetical System 1 trade at a time. Same-bar order in the tracker: exit check first, then open.
// Same-bar order for the real entry: a hypothetical trade that completes on bar i updates lastWin before the entry test on bar i.
export const meta = {
  id: "c1023-pop-12",
  name: "Turtle System 1 on US stocks: 20-day breakout taken only after a losing breakout, 55-day fail-safe, 2N stop, 10/20-day exits",
  family: "trend",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { s1: 20, s1exit: 10, s2: 55, s2exit: 20, atr: 20, stopN: 2 },
};

function hiOf(bars, a, b) {
  if (a < 0) return NaN;
  let m = -Infinity;
  for (let k = a; k <= b; k++) if (bars[k].high > m) m = bars[k].high;
  return m;
}
function loOf(bars, a, b) {
  if (a < 0) return NaN;
  let m = Infinity;
  for (let k = a; k <= b; k++) if (bars[k].low < m) m = bars[k].low;
  return m;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0;
    st.hyp = null; // hypothetical System 1 tracker: { entry, stop } or null
    st.lastWin = false; // lastOutcome == winner
    st.entryType = "";
    st.stop = NaN;
  }
  const c = bars[i].close;
  const N = ctx.atr(p.atr, i);
  const s1 = c > hiOf(bars, i - p.s1, i - 1);
  const s2 = c > hiOf(bars, i - p.s2, i - 1);

  // Hypothetical tracker: exit an open trade first, then open one on an S1 breakout.
  if (st.hyp !== null) {
    if (c < loOf(bars, i - p.s1exit, i - 1) || c < st.hyp.stop) {
      st.lastWin = c > st.hyp.entry;
      st.hyp = null;
    }
  }
  if (st.hyp === null && s1) st.hyp = { entry: c, stop: c - p.stopN * N };

  // Real position.
  let next = st.pos;
  if (st.pos === 1) {
    const exit = c < st.stop ||
      (st.entryType === "S1" && c < loOf(bars, i - p.s1exit, i - 1)) ||
      (st.entryType === "S2" && c < loOf(bars, i - p.s2exit, i - 1));
    if (exit) next = 0;
  } else if ((s1 && !st.lastWin) || s2) {
    next = 1;
    st.entryType = s1 && !st.lastWin ? "S1" : "S2";
    st.stop = c - p.stopN * N;
  }
  st.pos = next;
  return next;
}
