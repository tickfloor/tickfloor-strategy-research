// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-30). Previous-month high/low sweep, first daily close back inside, target previous-month midpoint. ETF 1d.
export const meta = {
  id: "c1031-tjr-30",
  name: "Previous-month high/low sweep: first daily close back inside after a wick through last month's extreme, target last month's midpoint (ETF 1d)",
  family: "liquidity_sweep",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: true,
  params: { overshootATR: 0.05, minRR: 1, maxHold: 20 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) {
    st.pos = 0; st.eb = 0; st.stop = 0; st.tgt = 0; st.key = null;
    st.prevOK = false; st.PMH = NaN; st.PML = NaN; st.PMmid = NaN;
    st.brokeUp = false; st.brokeDn = false; st.doneS = false; st.doneL = false;
  }
  const b = bars[i], c = b.close;
  const A = ctx.atr(14);

  // Calendar month via resample: the last entry is the current month, the one before it is the previous month.
  const M = ctx.resample(bars, "1M");
  const cur = M[M.length - 1];
  if (cur.time !== st.key) {
    st.key = cur.time;
    const prev = M.length >= 2 ? M[M.length - 2] : null;
    st.prevOK = !!prev && prev.bars >= 15;
    if (st.prevOK) { st.PMH = prev.high; st.PML = prev.low; st.PMmid = (prev.high + prev.low) / 2; }
    st.brokeUp = false; st.brokeDn = false; st.doneS = false; st.doneL = false;
  }

  let out = 0;
  const inTrade = st.pos !== 0; // a trade open at the start of this bar (incl. its exit bar) blocks entries
  if (inTrade) {
    const hit = st.pos < 0
      ? c > st.stop || c <= st.tgt || i - st.eb >= p.maxHold
      : c < st.stop || c >= st.tgt || i - st.eb >= p.maxHold;
    if (hit) st.pos = 0;
    else out = st.pos;
  }
  if (st.prevOK && A > 0) {
    // First qualifying sweep of a side this month. One seen while in a trade is an ignored setup but still uses up the side.
    if (!st.doneS && b.high > st.PMH + p.overshootATR * A && c < st.PMH) {
      st.doneS = true;
      const dist = c - st.PMmid, R = b.high - c;
      if (!inTrade && !st.brokeUp && dist >= p.minRR * R) { st.pos = -1; st.stop = b.high; st.tgt = st.PMmid; st.eb = i; out = -1; }
    }
    if (!st.doneL && b.low < st.PML - p.overshootATR * A && c > st.PML) {
      st.doneL = true;
      const dist = st.PMmid - c, R = c - b.low;
      if (!inTrade && st.pos === 0 && !st.brokeDn && dist >= p.minRR * R) { st.pos = 1; st.stop = b.low; st.tgt = st.PMmid; st.eb = i; out = 1; }
    }
  }

  // "No earlier close beyond the level this month" is evaluated on earlier bars only.
  if (st.prevOK) {
    if (c > st.PMH) st.brokeUp = true;
    if (c < st.PML) st.brokeDn = true;
  }
  return out;
}
