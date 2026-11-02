// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-09).
export const meta = {
  id: "c1031-intraday-09",
  name: "Prior-week high/low breakout",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { weekBars: 168 },
};

const H = (t) => Math.floor(t / 3600) % 24;
const D = (t) => (Math.floor(t / 86400) + 4) % 7;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.wk = null; }
  const b = bars[i];
  const d = D(b.time), h = H(b.time);

  if (d === 1 && h === 0) {
    // new week: prior-week levels from bars i-168..i-1; failed contiguity = no trade this week
    st.pos = 0;
    st.wk = null;
    if (contig(bars, i, p.weekBars)) {
      let phi = -Infinity, plo = Infinity;
      for (let k = i - p.weekBars; k <= i - 1; k++) { phi = Math.max(phi, bars[k].high); plo = Math.min(plo, bars[k].low); }
      st.wk = { phi, plo, pmid: (phi + plo) / 2, traded: false };
    }
  }
  if (d === 0 && h === 23) { st.wk = null; st.pos = 0; return 0; }
  const wk = st.wk;
  if (!wk) { st.pos = 0; return 0; }

  const c = b.close;
  if (st.pos === 1) { if (c < wk.pmid) { st.pos = 0; return 0; } return 1; }
  if (st.pos === -1) { if (c > wk.pmid) { st.pos = 0; return 0; } return -1; }
  if (!wk.traded) {
    if (c > wk.phi) { st.pos = 1; wk.traded = true; }
    else if (c < wk.plo) { st.pos = -1; wk.traded = true; }
  }
  return st.pos;
}
