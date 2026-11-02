// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-09). Body close through a stack of swing levels, continuation.
export const meta = {
  id: "c1031-tjr-09",
  name: "Stacked-liquidity run: a body close through a stack of 3+ swing lows (or highs) continues, 'cookies in the jar' (crypto 1h)",
  family: "liquidity_run",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, lookback: 168, tolATR: 0.5, minMembers: 3, closeBeyondATR: 0.2, stopATR: 1, targetR: 2, maxHold: 24 },
};

// swing list entries with j in [lo, hi], newest first (list is ordered by j)
function recent(list, lo, hi) {
  const out = [];
  for (let q = list.length - 1; q >= 0 && list[q].j >= lo; q--) if (list[q].j <= hi) out.push(list[q]);
  return out;
}

// Pool level: candidate L = a swing price; members = swings within tol of L on the pool side;
// valid if >= minM members and no bar from the earliest member to i-1 has crossed L (unswept).
// Returns the smallest valid L for lows, the largest for highs, or null.
function pickPool(win, bars, i, tol, minM, isLow) {
  let best = null;
  for (const cand of win) {
    const L = cand.p;
    let n = 0, e = Infinity;
    for (const m of win) {
      const inside = isLow ? (m.p >= L && m.p <= L + tol) : (m.p <= L && m.p >= L - tol);
      if (!inside) continue;
      n++;
      if (m.j < e) e = m.j;
    }
    if (n < minM) continue;
    let swept = false;
    for (let k = e; k <= i - 1 && !swept; k++) swept = isLow ? bars[k].low < L : bars[k].high > L;
    if (swept) continue;
    if (best === null || (isLow ? L < best : L > best)) best = L;
  }
  return best;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.sh === undefined) { st.sh = []; st.sl = []; st.pos = 0; st.held = 0; st.stop = 0; st.tgt = 0; }

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
  if (!(A > 0) || i < p.lookback) return 0;
  const lo = i - p.lookback, hi = i - 3;
  const tol = p.tolATR * A;
  const pl = pickPool(recent(st.sl, lo, hi), b, i, tol, p.minMembers, true);
  const ph = pickPool(recent(st.sh, lo, hi), b, i, tol, p.minMembers, false);

  const shortGo = pl !== null && c < pl - p.closeBeyondATR * A && b[i - 1].close >= pl;
  const longGo = ph !== null && c > ph + p.closeBeyondATR * A && b[i - 1].close <= ph;
  if (shortGo === longGo) return 0; // neither, or both: skip

  if (shortGo) {
    const stopLvl = pl + p.stopATR * A;
    const R = stopLvl - c;
    st.pos = -1; st.stop = stopLvl; st.tgt = c - p.targetR * R; st.held = 0;
    return -1;
  }
  const stopLvl = ph - p.stopATR * A;
  const R = c - stopLvl;
  st.pos = 1; st.stop = stopLvl; st.tgt = c + p.targetR * R; st.held = 0;
  return 1;
}
