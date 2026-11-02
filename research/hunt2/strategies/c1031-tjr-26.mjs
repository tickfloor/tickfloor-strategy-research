// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-26). Monthly BOS-up, then first daily rejection of the leg's 50% within 120 bars. US large caps, long only.
export const meta = {
  id: "c1031-tjr-26",
  name: "Monthly BOS with weekly retest of equilibrium: enter the first rejection of the 50% of the leg on large caps (US stocks 1d)",
  family: "premium_discount",
  source: "c1031/tjr",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  longShort: false,
  params: { monthlyK: 1, weeklyK: 2, entryWindow: 120, maxHold: 252 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) {
    st.pos = 0; st.eb = 0; st.stop = 0; st.nM = 0; st.nW = 0;
    st.mSh = []; st.wSl = []; st.setup = null;
  }
  const b = bars[i], c = b.close;

  // Monthly bars: a month is complete once its last daily bar has printed.
  // Monthly swing high (k=1) at month j is confirmed when month j+1 completes.
  const M = ctx.resample(bars, "1M");
  const nM = M[M.length - 1].complete ? M.length : M.length - 1;
  if (nM > st.nM) {
    st.nM = nM;
    const m = nM - 1;
    if (m >= 2 && M[m - 1].high > M[m - 2].high && M[m - 1].high > M[m].high) st.mSh.push(m - 1);
    if (st.mSh.length && st.pos === 0 && m >= 1) {
      const j = st.mSh[st.mSh.length - 1], SHp = M[j].high;
      if (M[m].close > SHp && M[m - 1].close <= SHp) {
        // BOS-up at completed month m. Leg = swing-high month j .. m; legHigh = daily highs from first day of m.
        let legLow = Infinity;
        for (let k = j; k <= m; k++) legLow = Math.min(legLow, M[k].low);
        let legHigh = -Infinity;
        for (let k = i; k >= 0 && bars[k].time >= M[m].time; k--) legHigh = Math.max(legHigh, bars[k].high);
        // first trading day after month m completes: bar i itself if month m ended on a weekend (bar i is already in the next month), else bar i+1
        const nm = new Date(bars[i].time * 1000), mm = new Date(M[m].time * 1000);
        const start = nm.getUTCFullYear() * 12 + nm.getUTCMonth() > mm.getUTCFullYear() * 12 + mm.getUTCMonth() ? i : i + 1;
        st.setup = { legLow, legHigh, start, end: start + p.entryWindow - 1 };
      }
    }
  }

  // Weekly bars (k=2 swings on complete weeks). A completed weekly close below the last confirmed weekly swing low is an exit.
  const W = ctx.resample(bars, "1w");
  const nW = W[W.length - 1].complete ? W.length : W.length - 1;
  let weeklyBreak = false;
  if (nW > st.nW) {
    st.nW = nW;
    const k = nW - 1, jw = k - 2;
    if (jw >= 2 && W[jw].low < W[jw - 2].low && W[jw].low < W[jw - 1].low && W[jw].low < W[jw + 1].low && W[jw].low < W[jw + 2].low) st.wSl.push(jw);
    if (st.wSl.length && W[k].close < W[st.wSl[st.wSl.length - 1]].low && st.pos !== 0 && i > st.eb) weeklyBreak = true;
  }

  if (st.pos !== 0) {
    if (c < st.stop || weeklyBreak || i - st.eb >= p.maxHold) { st.pos = 0; return 0; }
    return st.pos;
  }

  // Retest window: first daily bar with low <= EQ < close and close above the leg low.
  const S = st.setup;
  if (!S) return 0;
  if (i > S.end) { st.setup = null; return 0; }
  if (i < S.start) return 0;
  S.legHigh = Math.max(S.legHigh, b.high);
  const EQ = (S.legLow + S.legHigh) / 2;
  const A = ctx.atr(14);
  if (A > 0 && b.low <= EQ && c > EQ && c > S.legLow) {
    st.pos = 1; st.stop = S.legLow; st.eb = i; st.setup = null;
    return 1;
  }
  return 0;
}
