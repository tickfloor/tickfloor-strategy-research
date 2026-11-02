// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-33).
export const meta = {
  id: "c1031-intraday-33",
  name: "Dalton 80% rule: re-entry into the prior-day value area",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { bins: 24, vaFrac: 0.7, confirmCloses: 2, entryHoursTo: 12, stopVaWidth: 0.5 },
};

const H = (t) => Math.floor(t / 3600) % 24;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;
const clear = (st) => { for (const k of Object.keys(st)) delete st[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.day = null; }
  const b = bars[i];
  const h = H(b.time);

  if (h === 0) {
    // prior day = bars i-24..i-1 (contiguity guard fails -> return 0 and clear state, per spec)
    st.pos = 0;
    st.day = null;
    if (!contig(bars, i, 24)) { clear(st); return 0; }
    let lo = Infinity, hi = -Infinity;
    for (let k = i - 24; k <= i - 1; k++) { lo = Math.min(lo, bars[k].low); hi = Math.max(hi, bars[k].high); }
    if (hi > lo) {
      const N = p.bins;
      const w = (hi - lo) / N;
      const vol = new Array(N).fill(0);
      let total = 0;
      for (let k = i - 24; k <= i - 1; k++) {
        const bk = bars[k];
        const tp = (bk.high + bk.low + bk.close) / 3;
        const bin = Math.min(N - 1, Math.floor(((tp - lo) / (hi - lo)) * N));
        vol[bin] += bk.volume;
        total += bk.volume;
      }
      let poc = 0;
      for (let k = 1; k < N; k++) if (vol[k] > vol[poc]) poc = k; // ties -> lowest
      let bot = poc, top = poc, cov = vol[poc];
      while (cov < p.vaFrac * total) {
        const up = top + 1 < N ? top + 1 : -1;
        const dn = bot - 1 >= 0 ? bot - 1 : -1;
        if (up < 0 && dn < 0) break;
        if (up >= 0 && (dn < 0 || vol[up] >= vol[dn])) { top = up; cov += vol[up]; } // ties -> upper
        else { bot = dn; cov += vol[dn]; }
      }
      const VAH = lo + (top + 1) * w;
      const VAL = lo + bot * w;
      const openAbove = b.open > VAH, openBelow = b.open < VAL;
      if (openAbove || openBelow) st.day = { VAH, VAL, openAbove, inside: 0, traded: false };
    }
    return 0;
  }

  if (h === 23) { st.pos = 0; return 0; }
  const d = st.day;
  if (!d) { st.pos = 0; return 0; }

  const c = b.close;
  const wv = d.VAH - d.VAL;
  if (st.pos === 1) {
    if (c >= d.VAH || c < d.VAL - p.stopVaWidth * wv) st.pos = 0;
    return st.pos;
  }
  if (st.pos === -1) {
    if (c <= d.VAL || c > d.VAH + p.stopVaWidth * wv) st.pos = 0;
    return st.pos;
  }
  if (h >= 1 && h <= p.entryHoursTo) {
    if (c >= d.VAL && c <= d.VAH) d.inside++;
    else d.inside = 0;
    if (d.inside >= p.confirmCloses && !d.traded) {
      d.traded = true;
      st.pos = d.openAbove ? -1 : 1;
    }
  }
  return st.pos;
}
