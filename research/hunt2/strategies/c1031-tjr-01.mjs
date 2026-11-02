// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-01). Stacked equal-highs/lows pool sweep fade, 1h crypto.
export const meta = {
  id: "c1031-tjr-01",
  name: "Equal-highs / equal-lows liquidity sweep: fade a wick through a stacked pool that closes back inside (crypto 1h)",
  family: "liquidity_sweep",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, lookback: 120, tolATR: 0.15, minMembers: 2, overshootATR: 0.05, rMin: 0.3, rMax: 3, targetR: 2, maxHold: 24 },
};

// Swing at j = i-2 is confirmed by the close of bar i (k = 2 each side). Pushed in index order.
function confirm(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const b = bars;
  if (b[j].high > b[j - 2].high && b[j].high > b[j - 1].high && b[j].high > b[j + 1].high && b[j].high > b[j + 2].high) st.sh.push(j);
  if (b[j].low < b[j - 2].low && b[j].low < b[j - 1].low && b[j].low < b[j + 1].low && b[j].low < b[j + 2].low) st.sl.push(j);
}

// dir -1: stacked swing-high pool, largest valid level. dir +1: stacked swing-low pool, smallest valid level. null if none.
function bestPool(bars, i, ids, dir, A, p) {
  const lo = i - p.lookback;
  const px = (j) => (dir < 0 ? bars[j].high : bars[j].low);
  const cand = [];
  for (let t = ids.length - 1; t >= 0 && ids[t] >= lo; t--) if (ids[t] <= i - 3) cand.push(ids[t]);
  cand.sort((a, b) => (dir < 0 ? px(b) - px(a) : px(a) - px(b)));
  const tol = p.tolATR * A;
  for (const jc of cand) {
    const L = px(jc);
    let members = 0, latest = -1;
    for (const j of cand) {
      const v = px(j);
      if (dir < 0 ? v <= L && v >= L - tol : v >= L && v <= L + tol) { members++; if (j > latest) latest = j; }
    }
    if (members < p.minMembers) continue;
    let swept = false;
    for (let k = latest; k < i && !swept; k++) swept = dir < 0 ? bars[k].high > L : bars[k].low < L;
    if (!swept) return L;
  }
  return null;
}

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) { st.pos = 0; st.sh = []; st.sl = []; st.entry = 0; st.stop = 0; st.R = 0; st.eb = 0; }
  confirm(bars, i, st);
  const b = bars[i], c = b.close;
  if (st.pos !== 0) {
    const hit = st.pos < 0
      ? c > st.stop || c <= st.entry - p.targetR * st.R || i - st.eb >= p.maxHold
      : c < st.stop || c >= st.entry + p.targetR * st.R || i - st.eb >= p.maxHold;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }
  const A = ctx.atr(14);
  if (!(A > 0)) return 0;
  const hiL = bestPool(bars, i, st.sh, -1, A, p);
  const loL = bestPool(bars, i, st.sl, 1, A, p);
  let short = null, long = null;
  if (hiL !== null && b.high > hiL + p.overshootATR * A && c < hiL) {
    const R = b.high - c;
    if (R >= p.rMin * A && R <= p.rMax * A) short = { stop: b.high, R };
  }
  if (loL !== null && b.low < loL - p.overshootATR * A && c > loL) {
    const R = c - b.low;
    if (R >= p.rMin * A && R <= p.rMax * A) long = { stop: b.low, R };
  }
  if ((short === null) === (long === null)) return 0; // nothing, or both sides qualify: skip
  const s = short ?? long;
  st.pos = short ? -1 : 1;
  st.entry = c; st.stop = s.stop; st.R = s.R; st.eb = i;
  return st.pos;
}
