// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-06). Elder 1993, MACD-histogram divergence.
export const meta = {
  id: "c1031-retailta-06",
  name: "MACD histogram bullish divergence: lower price low, higher histogram low, confirmed pivot",
  family: "momentum",
  source: "c1031/retailta",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { fast: 12, slow: 26, signal: 9, K: 3, minGap: 8, maxGap: 40, maxHold: 15 },
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
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.hist = []; st.piv = []; st.ms = { c: 0, s: 0, e: NaN }; }

  // Histogram = (EMA12 - EMA26) minus its EMA9, the EMA9 seeded with the SMA of its first 9 values.
  const macd = ctx.ema("close", pr.fast, i) - ctx.ema("close", pr.slow, i);
  let h = NaN;
  if (Number.isFinite(macd)) {
    const ms = st.ms;
    if (ms.c < pr.signal) { ms.s += macd; ms.c++; if (ms.c === pr.signal) ms.e = ms.s / pr.signal; }
    else ms.e += (2 / (pr.signal + 1)) * (macd - ms.e);
    if (ms.c === pr.signal) h = macd - ms.e;
  }
  st.hist[i] = h;

  // Pivot p = i - K is confirmed now; pair it with the most recent earlier pivot q that is 8..40 bars back.
  const wasFlat = st.pos === 0;
  const pv = i - pr.K;
  let enter = false;
  if (pv >= pr.K && pivotLowAt(bars, pv, pr.K)) {
    const hp = st.hist[pv];
    let q = null;
    for (let k = st.piv.length - 1; k >= 0; k--) {
      const gap = pv - st.piv[k].p;
      if (gap > pr.maxGap) break;
      if (gap >= pr.minGap) { q = st.piv[k]; break; }
    }
    enter = q !== null && bars[pv].low < q.low && hp > q.h && q.h < 0 && hp < 0;
    st.piv.push({ p: pv, low: bars[pv].low, h: hp });
  }

  if (wasFlat) {
    if (enter) { st.pos = 1; st.held = 0; }
  } else {
    st.held++;
    if (h > 0 || st.held >= pr.maxHold) st.pos = 0;
  }
  return st.pos;
}
