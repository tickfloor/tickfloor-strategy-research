export const meta = {
  id: "c1031-tjr-21",
  name: "HTF-bias-gated sweep: fade a swept 1h swing extreme only in the direction of the 4H structure, target the 4H swing (crypto 1h)",
  family: "tjr_core_model",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, sweepATR: 0.05, rMin: 0.3, rMax: 4, minRR: 1.5, maxHold: 72 },
};

// 1h swing k=2, confirmed at bar j+2.
function swingsUpdate(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const h = bars[j].high, l = bars[j].low;
  if (h > bars[j - 2].high && h > bars[j - 1].high && h > bars[j + 1].high && h > bars[j + 2].high) st.sh.push({ idx: j, p: h });
  if (l < bars[j - 2].low && l < bars[j - 1].low && l < bars[j + 1].low && l < bars[j + 2].low) st.sl.push({ idx: j, p: l });
}

// 4H bars from 1h bars (4-hour blocks); swing k=2 on complete 4H bars.
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

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const P = ctx.params;
  if (st.sh === undefined) { st.sh = []; st.sl = []; st.f4 = []; st.sh4 = []; st.sl4 = []; st.cg = -1; st.pos = 0; st.entry = 0; st.stop = 0; st.tgt = 0; }
  swingsUpdate(bars, i, st);
  update4H(bars, i, st);
  const bar = bars[i];

  if (st.pos !== 0) {
    const held = i - st.entry;
    const hit = st.pos === 1 ? (bar.close <= st.stop || bar.close >= st.tgt) : (bar.close >= st.stop || bar.close <= st.tgt);
    if (hit || held >= P.maxHold) { st.pos = 0; return 0; }
    return st.pos;
  }
  const A = ctx.atr(14, i);
  if (Number.isNaN(A)) return 0;
  const b = bias4(st);
  const ls = st.sl[st.sl.length - 1];
  const hs = st.sh[st.sh.length - 1];
  const sh4 = st.sh4[st.sh4.length - 1];
  const sl4 = st.sl4[st.sl4.length - 1];

  if (b === 1 && ls !== undefined && sh4 !== undefined && bar.low < ls.p - P.sweepATR * A && bar.close > ls.p) {
    const stop = bar.low;
    const R = bar.close - stop;
    if (R >= P.rMin * A && R <= P.rMax * A && sh4.p - bar.close >= P.minRR * R) {
      st.pos = 1; st.entry = i; st.stop = stop; st.tgt = sh4.p;
      return 1;
    }
  }
  if (b === -1 && hs !== undefined && sl4 !== undefined && bar.high > hs.p + P.sweepATR * A && bar.close < hs.p) {
    const stop = bar.high;
    const R = stop - bar.close;
    if (R >= P.rMin * A && R <= P.rMax * A && bar.close - sl4.p >= P.minRR * R) {
      st.pos = -1; st.entry = i; st.stop = stop; st.tgt = sl4.p;
      return -1;
    }
  }
  return 0;
}
