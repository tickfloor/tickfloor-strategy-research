export const meta = {
  id: "c1031-tjr-24",
  name: "Weekly BOS, daily retrace: after a weekly body-close break of structure, enter the first daily rejection of the 50% of the leg (ETF 1d)",
  family: "htf_cascade",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: true,
  params: { weeklyK: 2, entryWindow: 30, maxHold: 60 },
};

// Weekly swing k=2 on completed weeks (confirmed when the week two later completes).
// The completed weeks are every resampled week except the last one, which is still open.
export function signal(bars, i, ctx) {
  const st = ctx.state;
  const P = ctx.params;
  if (st.nW === undefined) { st.nW = 0; st.wsh = []; st.wsl = []; st.armed = null; st.pos = 0; st.entry = 0; st.stop = 0; st.tgt = 0; }
  const bar = bars[i];
  const W = ctx.resample(bars, "1w").slice(0, -1);

  for (let m = st.nW; m < W.length; m++) {
    const j = m - 2;
    if (j >= 2) {
      const h = W[j].high, l = W[j].low;
      if (h > W[j - 2].high && h > W[j - 1].high && h > W[j + 1].high && h > W[j + 2].high) st.wsh.push({ idx: j, p: h });
      if (l < W[j - 2].low && l < W[j - 1].low && l < W[j + 1].low && l < W[j + 2].low) st.wsl.push({ idx: j, p: l });
    }
    if (m < 1) continue;
    const wk = W[m];
    const sh = st.wsh[st.wsh.length - 1];
    const sl = st.wsl[st.wsl.length - 1];
    if (st.pos !== 0) continue; // new setups are ignored while a position is open
    if (sh !== undefined && wk.close > sh.p && W[m - 1].close <= sh.p) {
      let legLow = Infinity;
      for (let k = sh.idx; k <= m; k++) if (W[k].low < legLow) legLow = W[k].low;
      st.armed = { side: 1, startI: i, lvl: legLow, runHi: Math.max(wk.high, bar.high), runLo: 0 };
    } else if (sl !== undefined && wk.close < sl.p && W[m - 1].close >= sl.p) {
      let legHigh = -Infinity;
      for (let k = sl.idx; k <= m; k++) if (W[k].high > legHigh) legHigh = W[k].high;
      st.armed = { side: -1, startI: i, lvl: legHigh, runLo: Math.min(wk.low, bar.low), runHi: 0 };
    }
  }
  st.nW = W.length;

  const a = st.armed;
  if (a !== null && a.startI !== i) {
    if (a.side === 1) a.runHi = Math.max(a.runHi, bar.high);
    else a.runLo = Math.min(a.runLo, bar.low);
  }
  if (a !== null && i - a.startI > P.entryWindow - 1) st.armed = null;

  if (st.pos !== 0) {
    const held = i - st.entry;
    const hit = st.pos === 1
      ? (bar.close < st.stop || bar.close >= st.tgt)
      : (bar.close > st.stop || bar.close <= st.tgt);
    if (hit || held >= P.maxHold) { st.pos = 0; return 0; }
    return st.pos;
  }

  const cur = st.armed;
  if (cur === null) return 0;
  if (cur.side === 1) {
    const EQ = (cur.lvl + cur.runHi) / 2;
    if (bar.low <= EQ && bar.close > EQ) {
      st.pos = 1; st.entry = i; st.stop = cur.lvl; st.tgt = cur.runHi; st.armed = null;
      return 1;
    }
  } else {
    const EQ = (cur.runLo + cur.lvl) / 2;
    if (bar.high >= EQ && bar.close < EQ) {
      st.pos = -1; st.entry = i; st.stop = cur.lvl; st.tgt = cur.runLo; st.armed = null;
      return -1;
    }
  }
  return 0;
}
