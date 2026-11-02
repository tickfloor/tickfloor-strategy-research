// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-04). Sweep + BOS (tjr-02 rule), enter first rejection of 50% EQ, 1h crypto.
export const meta = {
  id: "c1031-tjr-04",
  name: "Core TJR model, step 3: after sweep + BOS, enter the first rejection of the 50% equilibrium of the displacement leg (crypto 1h)",
  family: "tjr_core_model",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, sweepATR: 0.05, confirmBars: 12, retraceBars: 24, drawLookback: 48, rMin: 0.5, rMax: 6, minRR: 1, maxHold: 48 },
};

// Swing at j = i-2 is confirmed by the close of bar i (k = 2 each side).
function confirm(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const b = bars;
  if (b[j].high > b[j - 2].high && b[j].high > b[j - 1].high && b[j].high > b[j + 1].high && b[j].high > b[j + 2].high) st.sh.push(j);
  if (b[j].low < b[j - 2].low && b[j].low < b[j - 1].low && b[j].low < b[j + 1].low && b[j].low < b[j + 2].low) st.sl.push(j);
}

const beyond = (dir, v, lvl) => (dir < 0 ? v < lvl : v > lvl);

// tjr-02 sweep at bar i: short if high > H* + sweepATR*A (pullback low over j..i-1), long mirrored.
// Sets dir, lvl (pullback extreme), s, top/bot (leg over s..c, reset here), tgt (48-bar draw before s).
function startSweep(bars, i, st, A, p) {
  if (i < p.drawLookback) return false;
  const sh = st.sh.length ? st.sh[st.sh.length - 1] : -1;
  const sl = st.sl.length ? st.sl[st.sl.length - 1] : -1;
  const shortSw = sh >= 0 && i - sh <= 60 && bars[i].high > bars[sh].high + p.sweepATR * A;
  const longSw = sl >= 0 && i - sl <= 60 && bars[i].low < bars[sl].low - p.sweepATR * A;
  let dir = 0, lvl = 0;
  if (shortSw !== longSw) { // both sides on one bar = no sweep, as in tjr-02
    if (shortSw) {
      lvl = Infinity;
      for (let k = sh; k < i; k++) lvl = Math.min(lvl, bars[k].low);
      dir = -1;
    } else {
      lvl = -Infinity;
      for (let k = sl; k < i; k++) lvl = Math.max(lvl, bars[k].high);
      dir = 1;
    }
  }
  if (dir === 0) return false;
  let tgt = dir < 0 ? Infinity : -Infinity;
  for (let k = i - p.drawLookback; k < i; k++) tgt = dir < 0 ? Math.min(tgt, bars[k].low) : Math.max(tgt, bars[k].high);
  st.dir = dir; st.lvl = lvl; st.s = i; st.top = bars[i].high; st.bot = bars[i].low; st.tgt = tgt;
  return true;
}

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) {
    st.pos = 0; st.ph = 0; st.sh = []; st.sl = []; st.dir = 0; st.lvl = 0; st.s = 0;
    st.top = 0; st.bot = 0; st.tgt = 0; st.cb = 0; st.stop = 0; st.eb = 0;
  }
  confirm(bars, i, st);
  const b = bars[i], c = b.close;
  if (st.pos !== 0) {
    const hit = st.pos < 0
      ? c >= st.stop || c <= st.tgt || i - st.eb >= p.maxHold
      : c <= st.stop || c >= st.tgt || i - st.eb >= p.maxHold;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }
  const A = ctx.atr(14);
  if (!(A > 0)) return 0;

  // Phase 2: BOS already confirmed at bar cb. Wait for the reaction at the 50% level.
  if (st.ph === 2) {
    const d = st.dir;
    if (i > st.cb + p.retraceBars || (d < 0 ? c > st.top : c < st.bot)) { st.ph = 0; return 0; }
    const EQ = (st.top + st.bot) / 2;
    const react = d < 0 ? b.high >= EQ && c < EQ : b.low <= EQ && c > EQ;
    if (!react) return 0;
    st.ph = 0;
    const R = d < 0 ? st.top - c : c - st.bot;
    const dist = d < 0 ? c - st.tgt : st.tgt - c;
    if (R < p.rMin * A || R > p.rMax * A || dist < p.minRR * R) return 0;
    st.pos = d; st.entry = c; st.stop = d < 0 ? st.top : st.bot; st.eb = i;
    return d;
  }

  // Phase 1: sweep armed, awaiting BOS within s..s+confirmBars. As in tjr-02, a new sweep restarts the window
  // (s, pullback level, draw) and the leg extremes keep accumulating from a still-live same-side window.
  if (st.ph === 1 && i > st.s + p.confirmBars) st.ph = 0;
  const keep = st.ph === 1 ? { dir: st.dir, top: st.top, bot: st.bot } : null;
  if (startSweep(bars, i, st, A, p)) {
    if (keep !== null && keep.dir === st.dir) { st.top = Math.max(st.top, keep.top); st.bot = Math.min(st.bot, keep.bot); }
    st.ph = 1;
  } else if (st.ph === 1) {
    st.top = Math.max(st.top, b.high);
    st.bot = Math.min(st.bot, b.low);
  }
  if (st.ph === 1 && beyond(st.dir, c, st.lvl)) st.ph = 2, st.cb = i;
  return 0;
}
