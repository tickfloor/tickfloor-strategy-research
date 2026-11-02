// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-22). Daily equal-level liquidity sweep on ETFs.
export const meta = {
  id: "c1031-tjr-22",
  name: "Equal-lows / equal-highs sweep on daily ETFs: fade the wick through a stacked pool that closes back inside",
  family: "liquidity_sweep",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: true,
  params: { k: 2, lookback: 60, tolATR: 0.25, minMembers: 2, overshootATR: 0.05, rMin: 0.3, rMax: 4, targetR: 2, maxHold: 15 },
};

// swing list entries with j in [lo, hi], newest first (list is ordered by j)
function recent(list, lo, hi) {
  const out = [];
  for (let q = list.length - 1; q >= 0 && list[q].j >= lo; q--) if (list[q].j <= hi) out.push(list[q]);
  return out;
}

// Pool level: members within tol of candidate L on the pool side; valid if >= minM members and
// no bar from the LATEST member to i-1 has crossed L. Smallest valid L for lows, largest for highs.
function pickPool(win, bars, i, tol, minM, isLow) {
  let best = null;
  for (const cand of win) {
    const L = cand.p;
    let n = 0, e = -Infinity;
    for (const m of win) {
      const inside = isLow ? (m.p >= L && m.p <= L + tol) : (m.p <= L && m.p >= L - tol);
      if (!inside) continue;
      n++;
      if (m.j > e) e = m.j;
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

  const longGo = pl !== null && b[i].low < pl - p.overshootATR * A && c > pl;
  const shortGo = ph !== null && b[i].high > ph + p.overshootATR * A && c < ph;
  if (longGo === shortGo) return 0; // neither, or both: skip

  const dir = longGo ? 1 : -1;
  const stop = longGo ? b[i].low : b[i].high;
  const R = Math.abs(c - stop);
  if (R < p.rMin * A || R > p.rMax * A) return 0;
  st.pos = dir; st.stop = stop; st.tgt = c + dir * p.targetR * R; st.held = 0;
  return dir;
}
