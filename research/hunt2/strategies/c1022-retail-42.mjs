// c1022 retail spec 42 (campaign-1022/prereg-retail.json, frozen before code).
// O'Neil follow-through day. SPY is holdout: QQQ stands in via proxyFor.
export const meta = {
  id: "c1022-retail-42",
  name: "O'Neil follow-through day market buy",
  family: "trend",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC"],
  proxyFor: { SPY: "QQQ" },
  params: { minGain: 0.0125, attemptDayMin: 4, attemptDayMax: 7, maxHold: 60, correctionPct: 0.9, correctionLookback: 60, rallyLowBars: 20 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.att = null; st.held = 0; st.posLow = NaN; }
  if (i < 1) return 0;
  const c = bars[i].close, pc = bars[i - 1].close;

  if (st.pos === 1) {
    st.held++;
    if (c < st.posLow || st.held >= p.maxHold) st.pos = 0;
    return st.pos;
  }

  // a rally attempt in progress: day = bars since day 1, inclusive
  if (st.att) {
    const day = i - st.att.d1 + 1;
    if (c < st.att.low || day > p.attemptDayMax) {
      st.att = null;
    } else if (day >= p.attemptDayMin && c / pc - 1 >= p.minGain && bars[i].volume > bars[i - 1].volume) {
      st.pos = 1; st.held = 0; st.posLow = st.att.low; st.att = null;
      return 1;
    }
  }

  // new day 1: a close above the prior close while in correction (close < 90% of 60-bar high)
  if (!st.att && i >= p.correctionLookback - 1 && i >= p.rallyLowBars - 1 && c > pc) {
    let hm = -Infinity;
    for (let k = i - p.correctionLookback + 1; k <= i; k++) if (bars[k].high > hm) hm = bars[k].high;
    if (c < p.correctionPct * hm) {
      let lo = Infinity;
      for (let k = i - p.rallyLowBars + 1; k <= i; k++) if (bars[k].low < lo) lo = bars[k].low;
      st.att = { d1: i, low: lo };
    }
  }
  return 0;
}
