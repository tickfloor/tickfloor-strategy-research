// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-29). Failed break of structure (bear/bull trap) on large caps.
export const meta = {
  id: "c1031-tjr-29",
  name: "Failed break of structure trap on large caps: a body close beyond the swing point lost within 3 days (US stocks 1d)",
  family: "market_structure",
  source: "c1031/tjr",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  longShort: true,
  params: { k: 2, bosATR: 0.1, trapBars: 3, rMin: 0.3, rMax: 4, targetR: 2, maxHold: 15 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.sh === undefined) { st.sh = []; st.sl = []; st.pos = 0; st.held = 0; st.stop = 0; st.tgt = 0; st.pS = null; st.pL = null; }

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
  if (!(A > 0)) return 0;
  const hs = st.sh.length ? st.sh[st.sh.length - 1].p : NaN; // H* as of bar i
  const ls = st.sl.length ? st.sl[st.sl.length - 1].p : NaN; // L* as of bar i

  // trap window: the first close back through the level within trapBars (bars b+1..b+3)
  if (st.pS !== null) {
    const q = st.pS;
    if (i > q.b + p.trapBars) st.pS = null;
    else if (c < q.lvl) {
      st.pS = null;
      let stop = -Infinity;
      for (let k = q.b; k <= i; k++) stop = Math.max(stop, b[k].high);
      const R = stop - c;
      if (R >= p.rMin * A && R <= p.rMax * A) { st.pos = -1; st.stop = stop; st.tgt = c - p.targetR * R; st.held = 0; st.pS = null; st.pL = null; return -1; }
      return 0;
    }
  }
  if (st.pL !== null) {
    const q = st.pL;
    if (i > q.b + p.trapBars) st.pL = null;
    else if (c > q.lvl) {
      st.pL = null;
      let stop = Infinity;
      for (let k = q.b; k <= i; k++) stop = Math.min(stop, b[k].low);
      const R = c - stop;
      if (R >= p.rMin * A && R <= p.rMax * A) { st.pos = 1; st.stop = stop; st.tgt = c + p.targetR * R; st.held = 0; st.pS = null; st.pL = null; return 1; }
      return 0;
    }
  }

  // BOS bars arm a trap: close beyond the swing point, the prior close not yet beyond it
  if (c > hs + p.bosATR * A && b[i - 1].close <= hs) st.pS = { b: i, lvl: hs };
  if (c < ls - p.bosATR * A && b[i - 1].close >= ls) st.pL = { b: i, lvl: ls };
  return 0;
}
