// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-28). Chande & Kroll (1994), StochRSI.
export const meta = {
  id: "c1031-retailta-28",
  name: "Hourly Stochastic RSI (14,14,3,3) cross up from below 20 above the 200 EMA",
  family: "momentum",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  params: { rsi: 14, stoch: 14, k: 3, d: 3, os: 20, ob: 80, trend: 200, maxHold: 48 },
};

// mean of the last n entries of arr, NaN if any is NaN or fewer than n exist
const lastMean = (arr, n) => {
  if (arr.length < n) return NaN;
  let s = 0;
  for (let j = arr.length - n; j < arr.length; j++) { if (!Number.isFinite(arr[j])) return NaN; s += arr[j]; }
  return s / n;
};

export function signal(bars, i, ctx) {
  const { rsi: rN, stoch: sN, k: kN, d: dN, os, ob, trend, maxHold } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.r = []; st.s = []; st.k = []; st.d = []; }
  // one push per bar keeps every array index-aligned with bars
  const r = ctx.rsi(rN, i);
  st.r.push(r);
  let s = NaN;
  if (st.r.length >= sN) {
    const win = st.r.slice(-sN);
    if (win.every(Number.isFinite)) {
      const hi = Math.max(...win), lo = Math.min(...win);
      s = hi === lo ? 0 : (r - lo) / (hi - lo);
    }
  }
  st.s.push(s);
  const K = 100 * lastMean(st.s, kN);
  st.k.push(K);
  const D = lastMean(st.k, dN);
  st.d.push(D);

  const n = st.k.length;
  const kNow = st.k[n - 1], dNow = st.d[n - 1];
  const kPrev = n >= 2 ? st.k[n - 2] : NaN, dPrev = n >= 2 ? st.d[n - 2] : NaN;
  const c = bars[i].close;
  if (st.pos === 1) {
    st.held++;
    if (kNow >= ob || st.held >= maxHold) st.pos = 0;
    return st.pos;
  }
  if (kPrev <= dPrev && kNow > dNow && kNow < os && c > ctx.ema("close", trend, i)) {
    st.pos = 1;
    st.held = 0;
  }
  return st.pos;
}
