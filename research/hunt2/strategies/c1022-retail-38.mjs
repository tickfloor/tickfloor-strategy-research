// c1022 retail spec 38 (campaign-1022/prereg-retail.json, frozen before code).
// TradingView Technical Rating. Per-asset: rating = (mean MA votes + mean oscillator votes) / 2.
// Readings: Bull/Bear Power mirror = bull>0 falling with EMA13 falling. ADX and EMA-based inputs are
// Wilder-style RMAs seeded at the first bar (alpha 1/14), updated once per bar in order.
export const meta = {
  id: "c1022-retail-38",
  name: "TradingView Technical Rating 'Strong Buy'",
  family: "other",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { enterRating: 0.5, exitRating: 0.1 },
};

const sgn = (a, b) => (a > b ? 1 : a < b ? -1 : 0);

// incremental ADX(14) state, advanced once per bar
function adxUpdate(st, bars, i) {
  if (i === 0) return;
  const h = bars[i].high, l = bars[i].low, pc = bars[i - 1].close;
  const ph = bars[i - 1].high, pl = bars[i - 1].low;
  const tr = Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc));
  const up = h - ph, dn = pl - l;
  const pdm = up > dn && up > 0 ? up : 0;
  const mdm = dn > up && dn > 0 ? dn : 0;
  if (st.an === 0) {
    st.str = tr; st.spdm = pdm; st.smdm = mdm;
  } else {
    st.str += (tr - st.str) / 14;
    st.spdm += (pdm - st.spdm) / 14;
    st.smdm += (mdm - st.smdm) / 14;
  }
  const pdi = st.str > 0 ? (100 * st.spdm) / st.str : 0;
  const mdi = st.str > 0 ? (100 * st.smdm) / st.str : 0;
  const dx = pdi + mdi > 0 ? (100 * Math.abs(pdi - mdi)) / (pdi + mdi) : 0;
  if (st.an === 0) st.adx = dx;
  else st.adx += (dx - st.adx) / 14;
  st.pdi = pdi;
  st.mdi = mdi;
  st.an++;
}

// fast %K raw value (Stoch 14 / Williams %R basis); NaN if the window is not full
function fastK(bars, j, n) {
  if (j < n - 1) return NaN;
  let hh = -Infinity, ll = Infinity;
  for (let k = j - n + 1; k <= j; k++) {
    if (bars[k].high > hh) hh = bars[k].high;
    if (bars[k].low < ll) ll = bars[k].low;
  }
  return hh === ll ? 50 : (100 * (bars[j].close - ll)) / (hh - ll);
}

function slowK(bars, j) {
  return (fastK(bars, j, 14) + fastK(bars, j - 1, 14) + fastK(bars, j - 2, 14)) / 3;
}

function cci(bars, j, n) {
  if (j < n - 1) return NaN;
  const tp = (k) => (bars[k].high + bars[k].low + bars[k].close) / 3;
  let s = 0;
  for (let k = j - n + 1; k <= j; k++) s += tp(k);
  const m = s / n;
  let md = 0;
  for (let k = j - n + 1; k <= j; k++) md += Math.abs(tp(k) - m);
  md /= n;
  return md === 0 ? 0 : (tp(j) - m) / (0.015 * md);
}

function sma(bars, field, n, j) {
  let s = 0;
  for (let k = j - n + 1; k <= j; k++) s += bars[k][field];
  return s / n;
}

function ao(bars, j) {
  if (j < 33) return NaN;
  const hl2 = (k) => (bars[k].high + bars[k].low) / 2;
  let s5 = 0, s34 = 0;
  for (let k = j - 4; k <= j; k++) s5 += hl2(k);
  for (let k = j - 33; k <= j; k++) s34 += hl2(k);
  return s5 / 5 - s34 / 34;
}

function stochRsiRaw(ctx, j) {
  let mn = Infinity, mx = -Infinity;
  for (let k = j - 13; k <= j; k++) {
    const r = ctx.rsi(14, k);
    if (r < mn) mn = r;
    if (r > mx) mx = r;
  }
  const r = ctx.rsi(14, j);
  return mx === mn ? 50 : (100 * (r - mn)) / (mx - mn);
}

function stochRsiK(ctx, j) {
  return (stochRsiRaw(ctx, j) + stochRsiRaw(ctx, j - 1) + stochRsiRaw(ctx, j - 2)) / 3;
}

function uo(bars, j) {
  if (j < 28) return NaN;
  const avg = (n) => {
    let bp = 0, tr = 0;
    for (let k = j - n + 1; k <= j; k++) {
      const pc = bars[k - 1].close;
      const lo = Math.min(bars[k].low, pc), hi = Math.max(bars[k].high, pc);
      bp += bars[k].close - lo;
      tr += hi - lo;
    }
    return tr > 0 ? bp / tr : 0;
  };
  return (100 * (4 * avg(7) + 2 * avg(14) + avg(28))) / 7;
}

function hh(bars, n, j) {
  let m = -Infinity;
  for (let k = j - n + 1; k <= j; k++) if (bars[k].high > m) m = bars[k].high;
  return m;
}

function ll(bars, n, j) {
  let m = Infinity;
  for (let k = j - n + 1; k <= j; k++) if (bars[k].low < m) m = bars[k].low;
  return m;
}

// Ichimoku components at bar j (needs j >= 51)
function ich(bars, j) {
  const tk = (hh(bars, 9, j) + ll(bars, 9, j)) / 2;
  const kj = (hh(bars, 26, j) + ll(bars, 26, j)) / 2;
  return { tk, kj, sa: (tk + kj) / 2, sb: (hh(bars, 52, j) + ll(bars, 52, j)) / 2 };
}

function ichVote(bars, i) {
  const I = ich(bars, i), J = ich(bars, i - 26);
  const top = Math.max(J.sa, J.sb), bot = Math.min(J.sa, J.sb);
  const c = bars[i].close;
  if (I.tk > I.kj && c > top && I.sa > I.sb) return 1;
  if (I.tk < I.kj && c < bot && I.sa < I.sb) return -1;
  return 0;
}

// Hull MA(9): WMA(2*WMA(close,4) - WMA(close,9), 3)
function wma(bars, n, j) {
  let num = 0, den = 0;
  for (let k = 0; k < n; k++) {
    const w = n - k;
    num += w * bars[j - k].close;
    den += w;
  }
  return num / den;
}

function hma9(bars, i) {
  if (i < 10) return NaN;
  let num = 0, den = 0;
  for (let k = 0; k < 3; k++) {
    const w = 3 - k;
    num += w * (2 * wma(bars, 4, i - k) - wma(bars, 9, i - k));
    den += w;
  }
  return num / den;
}

function vwma20(bars, i) {
  let pv = 0, v = 0;
  for (let k = i - 19; k <= i; k++) {
    pv += bars[k].close * bars[k].volume;
    v += bars[k].volume;
  }
  return v > 0 ? pv / v : NaN;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0; st.an = 0; st.adx = 0; st.pdi = 0; st.mdi = 0;
    st.msig = undefined; st.str = 0; st.spdm = 0; st.smdm = 0;
  }
  // incremental states: advance on every bar, before any early return
  adxUpdate(st, bars, i);
  if (i >= 25) {
    const line = ctx.ema("close", 12, i) - ctx.ema("close", 26, i);
    st.msig = st.msig === undefined ? line : st.msig + ((line - st.msig) * 2) / 10;
  }
  // rating undefined until the MA group has all inputs (SMA/EMA 200)
  if (i < 199) return st.pos;

  const c = bars[i].close;
  const ma = [];
  for (const n of [10, 20, 30, 50, 100, 200]) ma.push(sgn(c, ctx.sma("close", n, i)));
  for (const n of [10, 20, 30, 50, 100, 200]) ma.push(sgn(c, ctx.ema("close", n, i)));
  ma.push(sgn(c, vwma20(bars, i)));
  ma.push(sgn(c, hma9(bars, i)));
  ma.push(ichVote(bars, i));

  const osc = [];
  const r = ctx.rsi(14, i), rp = ctx.rsi(14, i - 1);
  osc.push(r < 30 && r > rp ? 1 : r > 70 && r < rp ? -1 : 0);

  const K = slowK(bars, i), D = (slowK(bars, i) + slowK(bars, i - 1) + slowK(bars, i - 2)) / 3;
  osc.push(K < 20 && K > D ? 1 : K > 80 && K < D ? -1 : 0);

  const cc = cci(bars, i, 20), ccp = cci(bars, i - 1, 20);
  osc.push(cc < -100 && cc > ccp ? 1 : cc > 100 && cc < ccp ? -1 : 0);

  osc.push(st.an >= 14 && st.adx > 20 && st.pdi > st.mdi ? 1 : st.an >= 14 && st.adx > 20 && st.mdi > st.pdi ? -1 : 0);

  const a0 = ao(bars, i), a1 = ao(bars, i - 1), a2 = ao(bars, i - 2);
  osc.push((a1 <= 0 && 0 < a0) || (a0 > 0 && a2 > a1 && a0 > a1) ? 1
    : (a1 >= 0 && 0 > a0) || (a0 < 0 && a2 < a1 && a0 < a1) ? -1 : 0);

  const mom = c - bars[i - 10].close, momP = bars[i - 1].close - bars[i - 11].close;
  osc.push(mom > momP ? 1 : mom < momP ? -1 : 0);

  const line = ctx.ema("close", 12, i) - ctx.ema("close", 26, i);
  osc.push(sgn(line, st.msig));

  const Ks = stochRsiK(ctx, i), Ds = (stochRsiK(ctx, i) + stochRsiK(ctx, i - 1) + stochRsiK(ctx, i - 2)) / 3;
  osc.push(Ks < 20 && Ks > Ds ? 1 : Ks > 80 && Ks < Ds ? -1 : 0);

  const wr = fastK(bars, i, 14) - 100, wrP = fastK(bars, i - 1, 14) - 100;
  osc.push(wr < -80 && wr > wrP ? 1 : wr > -20 && wr < wrP ? -1 : 0);

  const e13 = ctx.ema("close", 13, i), e13p = ctx.ema("close", 13, i - 1);
  const bear = bars[i].low - e13, bearP = bars[i - 1].low - e13p;
  const bull = bars[i].high - e13, bullP = bars[i - 1].high - e13p;
  osc.push(bear < 0 && bear > bearP && e13 > e13p ? 1 : bull > 0 && bull < bullP && e13 < e13p ? -1 : 0);

  const u = uo(bars, i);
  osc.push(u > 70 ? 1 : u < 30 ? -1 : 0);

  const maMean = ma.reduce((a, b) => a + b, 0) / ma.length;
  const oscMean = osc.reduce((a, b) => a + b, 0) / osc.length;
  const rating = (maMean + oscMean) / 2;

  if (st.pos === 0) {
    if (rating > p.enterRating) st.pos = 1;
  } else if (rating < p.exitRating) {
    st.pos = 0;
  }
  return st.pos;
}
