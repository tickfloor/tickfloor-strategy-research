// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-27). Cardwell/Brown and Constance Brown, hidden bullish RSI divergence.
export const meta = {
  id: "c1031-retailta-27",
  name: "Hidden bullish RSI(14) divergence in an uptrend: higher price low with a lower RSI low",
  family: "momentum",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  params: { rsi: 14, K: 3, minGap: 8, maxGap: 40, trend: 200, maxHold: 20 },
};

// Pivot low at p: low[p] strictly below the K lows before it and the K lows after it.
function pivotLowAt(bars, p, K) {
  for (let k = 1; k <= K; k++) {
    if (!(bars[p].low < bars[p - k].low && bars[p].low < bars[p + k].low)) return false;
  }
  return true;
}

export function signal(bars, i, ctx) {
  const pr = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.stop = NaN; st.rsi = []; st.piv = []; }
  st.rsi[i] = ctx.rsi(pr.rsi, i);

  // Pivot p = i - K is confirmed now; pair it with the most recent earlier pivot q that is 8..40 bars back.
  const wasFlat = st.pos === 0;
  const pv = i - pr.K;
  let enter = false;
  let entryStop = NaN;
  if (pv >= pr.K && pivotLowAt(bars, pv, pr.K)) {
    const rp = st.rsi[pv];
    let q = null;
    for (let k = st.piv.length - 1; k >= 0; k--) {
      const gap = pv - st.piv[k].p;
      if (gap > pr.maxGap) break;
      if (gap >= pr.minGap) { q = st.piv[k]; break; }
    }
    enter = q !== null && bars[pv].low > q.low && rp < q.r && rp < 50 && bars[i].close > ctx.ema("close", pr.trend, i);
    if (enter) entryStop = bars[pv].low;
    st.piv.push({ p: pv, low: bars[pv].low, r: rp });
  }

  if (wasFlat) {
    if (enter) { st.pos = 1; st.held = 0; st.stop = entryStop; }
  } else {
    st.held++;
    if (bars[i].close < st.stop || st.held >= pr.maxHold) st.pos = 0;
  }
  return st.pos;
}
