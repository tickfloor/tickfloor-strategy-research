// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-13). Failed break-of-structure trap, short and mirror. 1h crypto.
export const meta = {
  id: "c1031-tjr-13",
  name: "Failed break of structure trap: a body close above the swing high that is lost within 3 bars, short (and the mirror) (crypto 1h)",
  family: "failed_breakout",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, bosATR: 0.1, trapBars: 3, rMin: 0.3, rMax: 4, targetR: 2, maxHold: 24 },
};

// k=2 swing: bar j is confirmed at the close of bar j+2.
function confirm(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const b = bars[j];
  if (b.high > bars[j - 2].high && b.high > bars[j - 1].high && b.high > bars[j + 1].high && b.high > bars[j + 2].high) st.sh.push(j);
  if (b.low < bars[j - 2].low && b.low < bars[j - 1].low && b.low < bars[j + 1].low && b.low < bars[j + 2].low) st.sl.push(j);
}

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) { st.pos = 0; st.sh = []; st.sl = []; st.eb = 0; st.stop = 0; st.tgt = 0; st.pend = []; }
  confirm(bars, i, st);
  const b = bars[i], c = b.close;
  const A = ctx.atr(14);

  // Pending traps (window b+1..b+trapBars). Tracked on every bar so the stop extreme stays exact.
  let entry = null;
  const keep = [];
  for (const P of st.pend) {
    if (i > P.b + p.trapBars) continue;
    P.ext = P.dir < 0 ? Math.max(P.ext, b.high) : Math.min(P.ext, b.low);
    const trap = P.dir < 0 ? c < P.lvl : c > P.lvl;
    if (!trap) { keep.push(P); continue; }
    const R = P.dir < 0 ? P.ext - c : c - P.ext;
    if (!entry && A > 0 && R >= p.rMin * A && R <= p.rMax * A) {
      entry = { dir: P.dir, stop: P.ext, tgt: c + P.dir * p.targetR * R };
    }
  }
  st.pend = keep;

  // New BOS (crossing event) at bar i, using the swing levels known at i. Setups are only opened while flat.
  if (st.sh.length && st.sl.length && A > 0 && st.pos === 0) {
    const H = bars[st.sh[st.sh.length - 1]].high;
    const L = bars[st.sl[st.sl.length - 1]].low;
    if (c > H + p.bosATR * A && bars[i - 1].close <= H) st.pend.push({ dir: -1, b: i, lvl: H, ext: b.high });
    if (c < L - p.bosATR * A && bars[i - 1].close >= L) st.pend.push({ dir: 1, b: i, lvl: L, ext: b.low });
  }

  if (st.pos !== 0) {
    const hit = st.pos < 0
      ? c >= st.stop || c <= st.tgt || i - st.eb >= p.maxHold
      : c <= st.stop || c >= st.tgt || i - st.eb >= p.maxHold;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }
  if (entry) {
    st.pos = entry.dir; st.stop = entry.stop; st.tgt = entry.tgt; st.eb = i;
    st.pend = [];
    return st.pos;
  }
  return 0;
}
