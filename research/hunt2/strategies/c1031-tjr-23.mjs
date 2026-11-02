// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-23). Daily structure continuation, premium/discount rejection of the last leg. ETF 1d.
export const meta = {
  id: "c1031-tjr-23",
  name: "Daily premium/discount continuation: HH/HL or LH/LL structure, enter the first rejection of the 50% of the last swing leg (ETF 1d)",
  family: "premium_discount",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: true,
  params: { k: 2, rMin: 0.5, rMax: 10, maxHold: 40 },
};

// k=2 swing: bar j is confirmed at the close of bar j+2.
function confirm(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const b = bars[j];
  if (b.high > bars[j - 2].high && b.high > bars[j - 1].high && b.high > bars[j + 1].high && b.high > bars[j + 2].high) st.sh.push(j);
  if (b.low < bars[j - 2].low && b.low < bars[j - 1].low && b.low < bars[j + 1].low && b.low < bars[j + 2].low) st.sl.push(j);
}

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) { st.pos = 0; st.sh = []; st.sl = []; st.eb = 0; st.stop = 0; st.tgt = 0; st.dead = {}; }
  confirm(bars, i, st);
  const b = bars[i], c = b.close;

  // Legs: long = latest swing high SH and the swing low just before it; short = latest swing low and the swing high just before it.
  // A close beyond a leg's start cancels that leg for good, including closes while in a trade or while the structure is not UP/DOWN.
  const nh = st.sh.length, nl = st.sl.length;
  let longLeg = null, shortLeg = null;
  if (nh > 0) for (let t = nl - 1; t >= 0; t--) if (st.sl[t] < st.sh[nh - 1]) { longLeg = { key: `L${st.sh[nh - 1]}:${st.sl[t]}`, top: bars[st.sh[nh - 1]].high, lo: bars[st.sl[t]].low }; break; }
  if (nl > 0) for (let t = nh - 1; t >= 0; t--) if (st.sh[t] < st.sl[nl - 1]) { shortLeg = { key: `S${st.sl[nl - 1]}:${st.sh[t]}`, bot: bars[st.sl[nl - 1]].low, hi: bars[st.sh[t]].high }; break; }
  if (longLeg && c < longLeg.lo) st.dead[longLeg.key] = 1;
  if (shortLeg && c > shortLeg.hi) st.dead[shortLeg.key] = 1;

  if (st.pos !== 0) {
    const hit = st.pos > 0
      ? c < st.stop || c >= st.tgt || i - st.eb >= p.maxHold
      : c > st.stop || c <= st.tgt || i - st.eb >= p.maxHold;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }

  if (nh < 2 || nl < 2) return 0;
  const A = ctx.atr(14);
  if (!(A > 0)) return 0;
  const H1 = st.sh[nh - 1], H0 = st.sh[nh - 2], L1 = st.sl[nl - 1], L0 = st.sl[nl - 2];
  const up = bars[H1].high > bars[H0].high && bars[L1].low > bars[L0].low;
  const down = bars[H1].high < bars[H0].high && bars[L1].low < bars[L0].low;

  if (up && longLeg && st.dead[longLeg.key] === undefined) {
    const EQ = (longLeg.top + longLeg.lo) / 2;
    if (b.low <= EQ && c > EQ && c < longLeg.top) {
      const R = c - longLeg.lo;
      if (R >= p.rMin * A && R <= p.rMax * A) {
        st.pos = 1; st.stop = longLeg.lo; st.tgt = longLeg.top; st.eb = i;
        return 1;
      }
    }
    return 0;
  }

  if (down && shortLeg && st.dead[shortLeg.key] === undefined) {
    const EQ = (shortLeg.bot + shortLeg.hi) / 2;
    if (b.high >= EQ && c < EQ && c > shortLeg.bot) {
      const R = shortLeg.hi - c;
      if (R >= p.rMin * A && R <= p.rMax * A) {
        st.pos = -1; st.stop = shortLeg.hi; st.tgt = shortLeg.bot; st.eb = i;
        return -1;
      }
    }
  }
  return 0;
}
