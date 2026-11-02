export const meta = {
  id: "c1031-tjr-31",
  name: "Daily order block after a body-close BOS: retest of the last down candle before the displacement leg (ETF 1d)",
  family: "order_block",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: true,
  params: { k: 2, bodyATR: 1, obLookback: 5, entryWindow: 25, rMin: 0.3, rMax: 4, targetR: 2, maxHold: 20 },
};

// Swing k=2 (strict), confirmed at bar j+2.
function swingsUpdate(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const h = bars[j].high, l = bars[j].low;
  if (h > bars[j - 2].high && h > bars[j - 1].high && h > bars[j + 1].high && h > bars[j + 2].high) st.sh.push({ idx: j, p: h });
  if (l < bars[j - 2].low && l < bars[j - 1].low && l < bars[j + 1].low && l < bars[j + 2].low) st.sl.push({ idx: j, p: l });
}

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const P = ctx.params;
  if (st.sh === undefined) { st.sh = []; st.sl = []; st.pos = 0; st.entry = 0; st.stop = 0; st.tgt = 0; st.armed = null; }
  swingsUpdate(bars, i, st);
  const bar = bars[i];

  if (st.pos !== 0) {
    const held = i - st.entry;
    const hit = st.pos === 1
      ? (bar.close < st.stop || bar.close >= st.tgt)
      : (bar.close > st.stop || bar.close <= st.tgt);
    if (hit || held >= P.maxHold) { st.pos = 0; return 0; }
    return st.pos;
  }

  const A = ctx.atr(14, i);
  if (Number.isNaN(A)) return 0;

  // Armed setup from a BOS bar b: entry window is bars b+1 .. b+entryWindow.
  const a = st.armed;
  if (a !== null) {
    if (i > a.b + P.entryWindow) st.armed = null;
    else if (a.side === 1) {
      if (bar.close < a.lo) st.armed = null;
      else if (bar.low <= a.hi && bar.close > a.lo) {
        st.armed = null;
        const R = bar.close - a.lo;
        if (R >= P.rMin * A && R <= P.rMax * A) {
          st.pos = 1; st.entry = i; st.stop = a.lo; st.tgt = bar.close + P.targetR * R;
          return 1;
        }
      }
    } else {
      if (bar.close > a.hi) st.armed = null;
      else if (bar.high >= a.lo && bar.close < a.hi) {
        st.armed = null;
        const R = a.hi - bar.close;
        if (R >= P.rMin * A && R <= P.rMax * A) {
          st.pos = -1; st.entry = i; st.stop = a.hi; st.tgt = bar.close - P.targetR * R;
          return -1;
        }
      }
    }
  }

  // New BOS setups are only armed while flat.
  if (st.armed === null && i >= P.obLookback) {
    const hs = st.sh[st.sh.length - 1];
    const ls = st.sl[st.sl.length - 1];
    const prev = bars[i - 1];
    const bullBOS = hs !== undefined && bar.close > hs.p && prev.close <= hs.p && bar.close - bar.open >= P.bodyATR * A;
    const bearBOS = ls !== undefined && bar.close < ls.p && prev.close >= ls.p && bar.open - bar.close >= P.bodyATR * A;
    if (bullBOS !== bearBOS) {
      let jOB = -1;
      for (let k = i - 1; k >= i - P.obLookback; k--) {
        if (bullBOS ? bars[k].close < bars[k].open : bars[k].close > bars[k].open) { jOB = k; break; }
      }
      if (jOB >= 0) {
        const ob = bars[jOB];
        st.armed = { side: bullBOS ? 1 : -1, b: i, lo: ob.low, hi: ob.high };
      }
    }
  }
  return 0;
}
