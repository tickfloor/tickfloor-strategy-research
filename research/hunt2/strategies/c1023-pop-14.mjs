// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-14). Van Tharp, Trade Your Way to Financial Freedom (1999), R-multiples; 2:1 reward-to-risk rule.
export const meta = {
  id: "c1023-pop-14",
  name: "Fixed 2:1 reward-to-risk bracket on a 20-day breakout above the 200-day: stop 2 ATR, target 4 ATR",
  family: "trend",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { breakout: 20, sma: 200, atr: 14, stopAtr: 2, targetAtr: 4, maxBars: 40 },
};

function hiOf(bars, a, b) {
  if (a < 0) return NaN;
  let m = -Infinity;
  for (let k = a; k <= b; k++) if (bars[k].high > m) m = bars[k].high;
  return m;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.at = 0; st.stop = NaN; st.target = NaN; }
  const c = bars[i].close;
  let next = 0;
  if (st.pos === 1) {
    const exit = c <= st.stop || c >= st.target || i - st.at >= p.maxBars;
    next = exit ? 0 : 1;
  } else if (c > hiOf(bars, i - p.breakout, i - 1) && c > ctx.sma("close", p.sma, i)) {
    const a = ctx.atr(p.atr, i);
    next = 1;
    st.at = i;
    st.stop = c - p.stopAtr * a;
    st.target = c + p.targetAtr * a;
  }
  st.pos = next;
  return next;
}
