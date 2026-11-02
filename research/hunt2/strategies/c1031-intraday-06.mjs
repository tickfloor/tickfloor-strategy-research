// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-06).
export const meta = {
  id: "c1031-intraday-06",
  name: "Compressed Asia range breakout in the London session",
  family: "volatility",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { asiaBars: 8, lookbackDays: 20, compressFrac: 0.6, minHistory: 10, entryHoursFrom: 8, entryHoursTo: 14, exitHour: 15 },
};

const H = (t) => Math.floor(t / 3600) % 24;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;
const clear = (st) => { for (const k of Object.keys(st)) delete st[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.arHist = []; st.armed = false; st.traded = false; }
  const b = bars[i];
  const h = H(b.time);

  if (h === p.asiaBars - 1) {
    // Asia range bars i-7..i (contiguity guard fails -> return 0 and clear state, per spec)
    if (!contig(bars, i, p.asiaBars - 1)) { clear(st); return 0; }
    let hi = -Infinity, lo = Infinity;
    for (let k = i - (p.asiaBars - 1); k <= i; k++) { hi = Math.max(hi, bars[k].high); lo = Math.min(lo, bars[k].low); }
    const ar = (hi - lo) / b.close;
    const hist = st.arHist;
    st.armed = false;
    if (hist.length >= p.minHistory) {
      const m = hist.reduce((a, x) => a + x, 0) / hist.length;
      if (ar < p.compressFrac * m) { st.armed = true; st.traded = false; st.hi = hi; st.lo = lo; st.mid = (hi + lo) / 2; }
    }
    hist.push(ar);
    if (hist.length > p.lookbackDays) hist.shift();
    return 0;
  }

  if (h < p.entryHoursFrom || h > p.entryHoursTo) {
    // outside the entry window: flat, disarmed (H==15 on, and any bar before the entry window)
    st.pos = 0; st.armed = false;
    return 0;
  }

  const c = b.close;
  if (st.pos === 1) { if (c < st.mid) { st.pos = 0; return 0; } return 1; }
  if (st.pos === -1) { if (c > st.mid) { st.pos = 0; return 0; } return -1; }
  if (st.armed && !st.traded) {
    if (c > st.hi) { st.pos = 1; st.traded = true; }
    else if (c < st.lo) { st.pos = -1; st.traded = true; }
  }
  return st.pos;
}
