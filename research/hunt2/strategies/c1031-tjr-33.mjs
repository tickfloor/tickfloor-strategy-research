// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-33). Monthly-open Judas swing against last month's bias.
export const meta = {
  id: "c1031-tjr-33",
  name: "Monthly-open Judas swing: with last month's bias, buy the first reclaim of the month's open after an early-month dip (ETF 1d)",
  family: "judas_swing",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: true,
  params: { armATR: 0.5, armDays: 10, confirmDays: 15, maxHold: 15, minRR: 1 },
};

// calendar month id (UTC) of an epoch-seconds time
const monthKey = (t) => {
  const d = new Date(t * 1000);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) {
    Object.assign(st, { pos: 0, held: 0, stop: 0, tgt: 0, cur: null, prev: null, bias: 0, k: 0, armed: false, armIdx: -1, done: false });
  }
  const c = b[i].close;

  // month bookkeeping: trading-day number k, this month's aggregate, last complete month and its bias
  if (i === 0 || monthKey(b[i].time) !== monthKey(b[i - 1].time)) {
    if (st.cur !== null) {
      const q = st.cur, rg = q.high - q.low;
      st.prev = q;
      st.bias = q.close > q.open && q.close >= q.low + 0.5 * rg ? 1 : (q.close < q.open && q.close <= q.low + 0.5 * rg ? -1 : 0);
    }
    st.cur = { open: b[i].open, high: b[i].high, low: b[i].low, close: c };
    st.k = 1; st.armed = false; st.armIdx = -1; st.done = false;
  } else {
    st.k++;
    st.cur.high = Math.max(st.cur.high, b[i].high);
    st.cur.low = Math.min(st.cur.low, b[i].low);
    st.cur.close = c;
  }

  if (st.pos !== 0) {
    st.held++;
    const exit = st.pos === 1
      ? (c < st.stop || c >= st.tgt || st.held >= p.maxHold)
      : (c > st.stop || c <= st.tgt || st.held >= p.maxHold);
    if (exit) st.pos = 0;
    return st.pos;
  }
  if (st.bias === 0 || st.done) return 0;
  const A = ctx.atr(14, i);
  if (!(A > 0)) return 0;

  const dir = st.bias, MO = st.cur.open;
  if (!st.armed) {
    // ARM: first day (k <= armDays) closing beyond the month open by armATR
    if (st.k <= p.armDays && (dir === 1 ? c < MO - p.armATR * A : c > MO + p.armATR * A)) { st.armed = true; st.armIdx = i; }
    return 0;
  }
  if (st.k > p.confirmDays) { st.done = true; return 0; }
  // CONFIRM: first later day (k <= confirmDays) closing back through the month open
  if (dir === 1 ? c > MO : c < MO) {
    let S = dir === 1 ? Infinity : -Infinity;
    for (let q = st.armIdx; q <= i; q++) S = dir === 1 ? Math.min(S, b[q].low) : Math.max(S, b[q].high);
    const tgt = dir === 1 ? st.prev.high : st.prev.low;
    st.done = true;
    if (dir === 1 ? tgt - c < p.minRR * (c - S) : c - tgt < p.minRR * (S - c)) return 0;
    st.pos = dir; st.stop = S; st.tgt = tgt; st.held = 0;
    return dir;
  }
  return 0;
}
