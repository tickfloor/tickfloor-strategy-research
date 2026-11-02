export const meta = {
  id: "c1031-tjr-08",
  name: "Premium/discount continuation: 4H HH/HL or LH/LL bias, enter the first 1h rejection of the 50% equilibrium of the last 4H leg (crypto 1h)",
  family: "premium_discount",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, tf: "4H", rMin: 0.5, rMax: 8, maxHold: 72 },
};

// 4H bars from 1h bars (aligned on 4-hour blocks). A 4H bar completes on its 4th hour.
// Swing k=2 on complete 4H bars, confirmed two later complete 4H bars (at the completing 1h bar).
function update4H(bars, i, st) {
  const bar = bars[i];
  const g = Math.floor(bar.time / 14400);
  if (st.cg !== g) { st.cg = g; st.chi = bar.high; st.clo = bar.low; }
  else { if (bar.high > st.chi) st.chi = bar.high; if (bar.low < st.clo) st.clo = bar.low; }
  if (Math.floor(bar.time / 3600) % 4 !== 3) return;
  const f = st.f4;
  f.push({ hi: st.chi, lo: st.clo });
  st.cg = -1;
  const j = f.length - 3;
  if (j < 2) return;
  if (f[j].hi > f[j - 2].hi && f[j].hi > f[j - 1].hi && f[j].hi > f[j + 1].hi && f[j].hi > f[j + 2].hi) st.sh4.push({ idx: j, p: f[j].hi });
  if (f[j].lo < f[j - 2].lo && f[j].lo < f[j - 1].lo && f[j].lo < f[j + 1].lo && f[j].lo < f[j + 2].lo) st.sl4.push({ idx: j, p: f[j].lo });
}

// +1 if last two confirmed 4H swing highs and lows both rise, -1 if both fall, else 0.
function bias4(st) {
  const s = st.sh4, l = st.sl4, n = s.length, m = l.length;
  if (n < 2 || m < 2) return 0;
  const up = s[n - 1].p > s[n - 2].p && l[m - 1].p > l[m - 2].p;
  const dn = s[n - 1].p < s[n - 2].p && l[m - 1].p < l[m - 2].p;
  return up ? 1 : dn ? -1 : 0;
}

// Latest confirmed swing in list `list` that comes before swing index idx.
function legBefore(list, idx) {
  for (let k = list.length - 1; k >= 0; k--) if (list[k].idx < idx) return list[k];
  return null;
}

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const P = ctx.params;
  if (st.f4 === undefined) { st.f4 = []; st.sh4 = []; st.sl4 = []; st.cg = -1; st.dead = {}; st.pos = 0; st.entry = 0; st.stop = 0; st.tgt = 0; }
  update4H(bars, i, st);
  const bar = bars[i];

  // Legs: long leg = latest 4H swing high SH and the 4H swing low just before it; short leg mirrored.
  const sh = st.sh4[st.sh4.length - 1];
  const sl = st.sl4[st.sl4.length - 1];
  let longLeg = null, shortLeg = null;
  if (sh) { const lo = legBefore(st.sl4, sh.idx); if (lo) longLeg = { key: "L" + sh.idx, hi: sh.p, lo: lo.p }; }
  if (sl) { const hi = legBefore(st.sh4, sl.idx); if (hi) shortLeg = { key: "S" + sl.idx, lo: sl.p, hi: hi.p }; }
  // A 1h close beyond the leg's start cancels that leg for good.
  if (longLeg && bar.close < longLeg.lo) st.dead[longLeg.key] = 1;
  if (shortLeg && bar.close > shortLeg.hi) st.dead[shortLeg.key] = 1;

  if (st.pos !== 0) {
    const held = i - st.entry;
    const hit = st.pos === 1 ? (bar.close <= st.stop || bar.close >= st.tgt) : (bar.close >= st.stop || bar.close <= st.tgt);
    if (hit || held >= P.maxHold) { st.pos = 0; return 0; }
    return st.pos;
  }

  const A = ctx.atr(14, i);
  if (Number.isNaN(A)) return 0;
  const b = bias4(st);
  if (b === 1 && longLeg && st.dead[longLeg.key] === undefined) {
    const EQ = (longLeg.hi + longLeg.lo) / 2;
    const R = bar.close - longLeg.lo;
    if (bar.low <= EQ && bar.close > EQ && bar.close < longLeg.hi && R >= P.rMin * A && R <= P.rMax * A) {
      st.pos = 1; st.entry = i; st.stop = longLeg.lo; st.tgt = longLeg.hi;
      return 1;
    }
  }
  if (b === -1 && shortLeg && st.dead[shortLeg.key] === undefined) {
    const EQ = (shortLeg.lo + shortLeg.hi) / 2;
    const R = shortLeg.hi - bar.close;
    if (bar.high >= EQ && bar.close < EQ && bar.close > shortLeg.lo && R >= P.rMin * A && R <= P.rMax * A) {
      st.pos = -1; st.entry = i; st.stop = shortLeg.hi; st.tgt = shortLeg.lo;
      return -1;
    }
  }
  return 0;
}
