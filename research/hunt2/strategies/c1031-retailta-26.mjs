// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-26). Regular bullish RSI divergence on confirmed pivot lows (K=3).
export const meta = {
  id: "c1031-retailta-26",
  name: "Regular bullish RSI(14) divergence on daily confirmed pivots",
  family: "momentum",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { rsi: 14, K: 3, minGap: 8, maxGap: 40, rsiMax: 35, exit: 55, maxHold: 20 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const p = ctx.params;
  if (st.pos === undefined) {
    st.pos = 0;
    st.piv = [];
    st.entry = -1;
  }

  // A pivot low at q0 = i-K is confirmed on bar i: strictly below the K lows on each side.
  let enter = false;
  const q0 = i - p.K;
  if (q0 >= p.K) {
    const lp = bars[q0].low;
    let isPivot = true;
    for (let k = 1; k <= p.K && isPivot; k++) {
      if (!(lp < bars[q0 - k].low && lp < bars[q0 + k].low)) isPivot = false;
    }
    if (isPivot) {
      const rp = ctx.rsi(p.rsi, q0);
      // Most recent earlier confirmed pivot whose gap lies in [minGap, maxGap].
      for (let j = st.piv.length - 1; j >= 0; j--) {
        const q = st.piv[j];
        const gap = q0 - q.p;
        if (gap > p.maxGap) break;
        if (gap < p.minGap) continue;
        if (lp < q.low && rp > q.rsi && q.rsi < p.rsiMax) enter = true;
        break;
      }
      st.piv.push({ p: q0, low: lp, rsi: rp });
    }
  }

  const r = ctx.rsi(p.rsi, i);
  if (st.pos === 1) {
    if (r > p.exit || i - st.entry >= p.maxHold) st.pos = 0;
  } else if (enter) {
    st.pos = 1;
    st.entry = i;
  }
  return st.pos;
}
