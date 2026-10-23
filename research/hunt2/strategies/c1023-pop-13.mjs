// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-13). Nicolas Darvas, How I Made $2,000,000 in the Stock Market (1960), box method.
// Clarified in prereg: a completed box is consumed by its first close above H or below L; a high above H before L is confirmed discards H.
export const meta = {
  id: "c1023-pop-13",
  name: "Darvas box breakout on crypto: 3-day confirmed box top and bottom near a 100-day high, buy the top on 1.5x volume, stop under the box",
  family: "trend",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1d",
  params: { confirmBars: 3, highLookback: 100, volMult: 1.5, volSma: 50 },
};

function hiOf(bars, a, b) {
  if (a < 0) return NaN;
  let m = -Infinity;
  for (let k = a; k <= b; k++) if (bars[k].high > m) m = bars[k].high;
  return m;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0;
    st.topH = null; // pending confirmed top
    st.topT = -1; // bar index of that top
    st.box = null; // completed box { H, L }
    st.stop = NaN;
  }
  if (i < 3) return 0;
  const b = bars;
  const c = b[i].close;

  // (1) a high above the pending top before its box completes discards that top
  if (st.box === null && st.topH !== null && b[i].high > st.topH) st.topH = null;

  // (2) bottom: u = i-3 is confirmed when the 3 bars after it all have higher lows
  let newBoxL = null;
  if (st.box === null && st.topH !== null && i - 3 > st.topT) {
    const u = i - 3;
    if (b[i - 2].low > b[u].low && b[i - 1].low > b[u].low && b[i].low > b[u].low) {
      newBoxL = b[u].low;
      st.box = { H: st.topH, L: newBoxL };
    }
  }

  // (3) top: t = i-3 is confirmed when the 3 bars after it all have lower highs; a higher top restarts construction
  if (st.box === null && b[i - 2].high < b[i - 3].high && b[i - 1].high < b[i - 3].high && b[i].high < b[i - 3].high) {
    if (st.topH === null || b[i - 3].high > st.topH) {
      st.topH = b[i - 3].high;
      st.topT = i - 3;
    }
  }

  // A box completed while long raises the stop to its L, only if that is above the current stop.
  if (newBoxL !== null && st.pos === 1) st.stop = Math.max(st.stop, newBoxL);

  // (4) consumption: first close above H (entry test) or below L (box void)
  let entered = false;
  if (st.box !== null && (c > st.box.H || c < st.box.L)) {
    if (c > st.box.H && st.pos === 0) {
      const volOk = b[i].volume > p.volMult * ctx.sma("volume", p.volSma, i - 1);
      const nearOk = c >= 0.97 * hiOf(b, i - p.highLookback, i - 1);
      if (volOk && nearOk) {
        entered = true;
        st.stop = st.box.L;
      }
    }
    st.box = null;
    st.topH = null;
  }

  // (5) exits and entries
  const next = st.pos === 1 ? (c < st.stop ? 0 : 1) : (entered ? 1 : 0);
  st.pos = next;
  return next;
}
