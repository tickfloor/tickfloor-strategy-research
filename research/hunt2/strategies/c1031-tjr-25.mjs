// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-25). Monthly BOS-up entry, hold through stage 1 (prior high reclaimed).
export const meta = {
  id: "c1031-tjr-25",
  name: "Monthly break of structure, hold until the prior high is reclaimed and a weekly BOS down (ETF 1d), TJR's long-term investment model",
  family: "htf_cascade",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: { monthlyK: 1, priorHighMonths: 12, weeklyK: 2, maxHold: 756 },
};

// calendar month id (UTC) of an epoch-seconds time
const monthKey = (t) => {
  const d = new Date(t * 1000);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) {
    Object.assign(st, { pos: 0, held: 0, stage1: false, T: 0, legLow: 0, exitW: false, nM: 0, nW: 0, SH: null, SWL: null, pend: null });
  }
  const c = b[i].close;

  // weekly: confirm k=2 swing lows as weeks complete; a completed weekly close under the last
  // confirmed swing low ends the trade, but only once stage 1 has been reached
  const wk = ctx.resample(b, "1w");
  const nW = wk.length && !wk[wk.length - 1].complete ? wk.length - 1 : wk.length;
  while (st.nW < nW) {
    const w = st.nW++;
    if (w >= 4) {
      const j = w - 2, L = wk[j].low;
      if (L < wk[j - 2].low && L < wk[j - 1].low && L < wk[j + 1].low && L < wk[w].low) st.SWL = L;
    }
    if (st.pos !== 0 && st.stage1 && st.SWL !== null && wk[w].close < st.SWL) st.exitW = true;
  }

  // monthly: confirm k=1 swing highs as months complete; BOS-up = close above last swing high, prior close not
  const mo = ctx.resample(b, "1M");
  const nM = mo.length && !mo[mo.length - 1].complete ? mo.length - 1 : mo.length;
  let detected = null;
  while (st.nM < nM) {
    const m = st.nM++;
    if (m >= 2) {
      const j = m - 1, H = mo[j].high;
      if (H > mo[j - 1].high && H > mo[m].high) st.SH = { idx: j, p: H };
    }
    if (st.pos === 0 && st.SH !== null && m >= 1 && mo[m].close > st.SH.p && mo[m - 1].close <= st.SH.p) {
      let T = st.SH.p;
      for (let k = Math.max(0, m - p.priorHighMonths); k < m; k++) T = Math.max(T, mo[k].high);
      let legLow = Infinity;
      for (let k = st.SH.idx; k <= m; k++) legLow = Math.min(legLow, mo[k].low);
      detected = { mKey: monthKey(mo[m].time), T, legLow };
    }
  }

  if (st.pos !== 0) {
    st.held++;
    if (!st.stage1 && c >= st.T) st.stage1 = true;
    let exit = st.held >= p.maxHold || (!st.stage1 && c < st.legLow) || (st.stage1 && st.exitW);
    st.exitW = false;
    if (exit) st.pos = 0;
    return st.pos;
  }

  // ENTER at the close of the first trading day after the BOS month completes
  if (detected !== null) st.pend = detected;
  if (st.pend !== null && monthKey(b[i].time) > st.pend.mKey) {
    const pd = st.pend;
    st.pend = null;
    st.pos = 1; st.held = 0; st.T = pd.T; st.legLow = pd.legLow; st.stage1 = c >= pd.T; st.exitW = false;
    return 1;
  }
  return 0;
}
