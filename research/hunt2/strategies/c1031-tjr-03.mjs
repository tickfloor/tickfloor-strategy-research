// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-03). Sweep-then-iFVG confirmation (TJR core model).
export const meta = {
  id: "c1031-tjr-03",
  name: "Core TJR model, iFVG confirmation: sweep of a swing high, then a close through the outer edge of the bullish FVG stack (crypto 1h)",
  family: "tjr_core_model",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, sweepATR: 0.05, stackBars: 8, minGapATR: 0.3, confirmBars: 12, drawLookback: 48, rMin: 0.5, rMax: 4, minRR: 1, maxHold: 48 },
};

// Stack edge at sweep bar s. Bullish: min lower edge (high[c-2]) of FVGs not closed below it through s.
// Bearish: max upper edge (low[c-2]) of FVGs not closed above it through s. null if none.
function stackEdge(bars, s, ctx, p, bull) {
  let edge = null;
  for (let c = s - p.stackBars; c <= s; c++) {
    if (c < 2) continue;
    const a = ctx.atr(14, c);
    if (!(a > 0)) continue;
    if (bull) {
      if (!(bars[c].low > bars[c - 2].high && bars[c - 1].close > bars[c - 1].open && bars[c].low - bars[c - 2].high >= p.minGapATR * a)) continue;
      const lo = bars[c - 2].high;
      let broke = false;
      for (let k = c; k <= s && !broke; k++) broke = bars[k].close < lo;
      if (!broke) edge = edge === null ? lo : Math.min(edge, lo);
    } else {
      if (!(bars[c].high < bars[c - 2].low && bars[c - 1].close < bars[c - 1].open && bars[c - 2].low - bars[c].high >= p.minGapATR * a)) continue;
      const hi = bars[c - 2].low;
      let broke = false;
      for (let k = c; k <= s && !broke; k++) broke = bars[k].close > hi;
      if (!broke) edge = edge === null ? hi : Math.max(edge, hi);
    }
  }
  return edge;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.sh === undefined) { st.sh = []; st.sl = []; st.pos = 0; st.pS = null; st.pL = null; st.held = 0; st.stop = 0; st.tgt = 0; }

  // swing confirmed at the close of bar i for j = i-2 (k=2, strict)
  const j = i - 2;
  if (j >= 2) {
    const h = b[j].high, l = b[j].low;
    if (h > b[j - 2].high && h > b[j - 1].high && h > b[j + 1].high && h > b[i].high) st.sh.push({ j, p: h });
    if (l < b[j - 2].low && l < b[j - 1].low && l < b[j + 1].low && l < b[i].low) st.sl.push({ j, p: l });
  }

  const c = b[i].close;
  if (st.pos !== 0) {
    st.held++;
    const exit = st.pos === 1
      ? (c <= st.stop || c >= st.tgt || st.held >= p.maxHold)
      : (c >= st.stop || c <= st.tgt || st.held >= p.maxHold);
    if (exit) st.pos = 0;
    return st.pos;
  }

  const A = ctx.atr(14, i);
  if (!(A > 0)) return 0;
  const hs = st.sh.length ? st.sh[st.sh.length - 1].p : NaN; // H* as of bar i
  const ls = st.sl.length ? st.sl[st.sl.length - 1].p : NaN; // L* as of bar i

  // 1) pending sweeps: iFVG close through the stack edge within confirmBars of the sweep
  let shortGo = null, longGo = null;
  if (st.pS !== null) {
    const q = st.pS;
    if (i - q.s > p.confirmBars) st.pS = null;
    else if (c < q.edge) shortGo = q;
  }
  if (st.pL !== null) {
    const q = st.pL;
    if (i - q.s > p.confirmBars) st.pL = null;
    else if (c > q.edge) longGo = q;
  }
  if (shortGo !== null && longGo !== null) { st.pS = null; st.pL = null; return 0; }

  if (shortGo !== null) {
    st.pS = null;
    let stop = -Infinity;
    for (let k = shortGo.s; k <= i; k++) stop = Math.max(stop, b[k].high);
    const R = stop - c;
    if (R < p.rMin * A || R > p.rMax * A || shortGo.s < p.drawLookback) return 0;
    let Lt = Infinity;
    for (let k = Math.max(0, shortGo.s - p.drawLookback); k < shortGo.s; k++) Lt = Math.min(Lt, b[k].low);
    if (c - Lt < p.minRR * R) return 0;
    st.pos = -1; st.stop = stop; st.tgt = Lt; st.held = 0; st.pS = null; st.pL = null;
    return -1;
  }
  if (longGo !== null) {
    st.pL = null;
    let stop = Infinity;
    for (let k = longGo.s; k <= i; k++) stop = Math.min(stop, b[k].low);
    const R = c - stop;
    if (R < p.rMin * A || R > p.rMax * A || longGo.s < p.drawLookback) return 0;
    let Ht = -Infinity;
    for (let k = Math.max(0, longGo.s - p.drawLookback); k < longGo.s; k++) Ht = Math.max(Ht, b[k].high);
    if (Ht - c < p.minRR * R) return 0;
    st.pos = 1; st.stop = stop; st.tgt = Ht; st.held = 0; st.pS = null; st.pL = null;
    return 1;
  }

  // 2) a new sweep arms a setup (ponytail: a newer sweep restarts the window, as in tjr-02)
  if (b[i].high > hs + p.sweepATR * A) {
    const edge = stackEdge(b, i, ctx, p, true);
    if (edge !== null) st.pS = { s: i, edge };
  }
  if (b[i].low < ls - p.sweepATR * A) {
    const edge = stackEdge(b, i, ctx, p, false);
    if (edge !== null) st.pL = { s: i, edge };
  }
  return 0;
}
