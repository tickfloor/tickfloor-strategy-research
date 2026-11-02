// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-12). Balanced price range (BPR) entry on first return.
export const meta = {
  id: "c1031-tjr-12",
  name: "Balanced price range: first return into the overlap of two opposite FVGs, trade in the direction of the later gap (crypto 1h)",
  family: "fair_value_gap",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { minGapATR: 0.2, minOverlapATR: 0.2, gapSpacing: 30, entryWindow: 48, rMin: 0.3, rMax: 4, targetR: 2, maxHold: 48 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.fvg === undefined) { st.fvg = []; st.bpr = null; st.pos = 0; st.held = 0; st.stop = 0; st.tgt = 0; }

  // FVG completed at bar i (middle bar i-1): bullish low[i] > high[i-2], bearish high[i] < low[i-2]
  const A = ctx.atr(14, i);
  if (i >= 2 && A > 0) {
    if (b[i].low > b[i - 2].high && b[i - 1].close > b[i - 1].open && b[i].low - b[i - 2].high >= p.minGapATR * A) {
      st.fvg.push({ c: i, bull: true, lo: b[i - 2].high, hi: b[i].low });
    } else if (b[i].high < b[i - 2].low && b[i - 1].close < b[i - 1].open && b[i - 2].low - b[i].high >= p.minGapATR * A) {
      st.fvg.push({ c: i, bull: false, lo: b[i].high, hi: b[i - 2].low });
    }
    while (st.fvg.length && st.fvg[0].c < i - p.gapSpacing - 2) st.fvg.shift();
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
  if (!(A > 0)) return 0;

  // pending BPR: entry on the first return into the overlap, cancelled by a close through the far edge
  const k = st.bpr;
  if (k !== null) {
    if (i > k.t + p.entryWindow) st.bpr = null;
    else if (k.dir === 1 ? (b[i].low <= k.hi && c > k.lo) : (b[i].high >= k.lo && c < k.hi)) {
      st.bpr = null;
      const R = k.dir === 1 ? c - k.stop : k.stop - c;
      if (R < p.rMin * A || R > p.rMax * A) return 0;
      st.pos = k.dir; st.stop = k.stop; st.tgt = c + k.dir * p.targetR * R; st.held = 0;
      return k.dir;
    } else if (k.dir === 1 ? c < k.lo : c > k.hi) st.bpr = null;
  }

  // new BPR at bar i: FVG completed at i and an opposite FVG completed in [i-gapSpacing, i-2] with enough overlap
  const cur = st.fvg.length && st.fvg[st.fvg.length - 1].c === i ? st.fvg[st.fvg.length - 1] : null;
  if (cur !== null) {
    for (let q = st.fvg.length - 2; q >= 0; q--) {
      const o = st.fvg[q];
      if (o.c < i - p.gapSpacing) break;
      if (o.c > i - 2 || o.bull === cur.bull) continue;
      const ovLo = Math.max(o.lo, cur.lo), ovHi = Math.min(o.hi, cur.hi);
      if (ovHi - ovLo >= p.minOverlapATR * A) {
        // ponytail: when several opposite FVGs overlap, the most recent one wins
        st.bpr = { t: i, dir: cur.bull ? 1 : -1, lo: ovLo, hi: ovHi, stop: cur.bull ? Math.min(o.lo, cur.lo) : Math.max(o.hi, cur.hi) };
        break;
      }
    }
  }
  return 0;
}
