// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-16). Midnight-open Judas swing with previous-day bias. 1h crypto.
export const meta = {
  id: "c1031-tjr-16",
  name: "Midnight-open Judas swing: with a daily bias, buy the first reclaim of the 00:00 UTC open after a false dip (crypto 1h)",
  family: "judas_swing",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { armATR: 0.5, armEndHour: 7, confirmEndHour: 11, closeFrac: 0.4, exitHour: 20 },
};

const dayOf = (t) => Math.floor(t / 86400);
const hourOf = (t) => Math.floor(t / 3600) % 24;

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) {
    st.pos = 0; st.stop = 0; st.tgt = 0; st.eb = 0;
    st.day = null; st.cur = null; st.prev = null; st.dOpen = NaN; st.bias = 0;
    st.arm = 0; st.S = 0; st.done = false;
  }
  const b = bars[i], c = b.close;
  const day = dayOf(b.time), h = hourOf(b.time);

  // Daily bookkeeping. prev = the previous UTC day, complete only if it has 24 hourly bars.
  if (day !== st.day) {
    st.prev = st.cur;
    st.cur = { o: b.open, h: b.high, l: b.low, c, n: 0 };
    st.day = day; st.dOpen = NaN; st.arm = 0; st.done = false; st.bias = 0;
    const P = st.prev;
    if (P && P.n === 24) {
      const rng = P.h - P.l;
      if (P.c > P.o && P.c >= P.l + 0.6 * rng) st.bias = 1;
      else if (P.c < P.o && P.c <= P.l + 0.4 * rng) st.bias = -1;
    }
  }
  st.cur.n++; st.cur.h = Math.max(st.cur.h, b.high); st.cur.l = Math.min(st.cur.l, b.low); st.cur.c = c;
  if (h === 0) st.dOpen = b.open;

  if (st.pos !== 0) {
    const hit = st.pos > 0
      ? c < st.stop || c >= st.tgt || h === p.exitHour
      : c > st.stop || c <= st.tgt || h === p.exitHour;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }

  const A = ctx.atr(14);
  if (st.bias === 0 || st.done || !(A > 0) || !Number.isFinite(st.dOpen)) return 0;
  const DO = st.dOpen, d = st.bias;

  if (st.arm === 0) {
    // ARM: first bar up to 07:00 UTC that closes beyond the open by 0.5 ATR, against the bias.
    if (h <= p.armEndHour && (d > 0 ? c < DO - p.armATR * A : c > DO + p.armATR * A)) {
      st.arm = 1; st.S = d > 0 ? b.low : b.high;
    }
    return 0;
  }

  st.S = d > 0 ? Math.min(st.S, b.low) : Math.max(st.S, b.high);
  if (h > p.confirmEndHour) { st.done = true; return 0; }
  if (!(d > 0 ? c > DO : c < DO)) return 0;

  // CONFIRM: first close back through the day open. Target = previous day's opposite extreme.
  st.done = true;
  const P = st.prev;
  const tgt = d > 0 ? P.h : P.l;
  const R = d > 0 ? c - st.S : st.S - c;
  const dist = d > 0 ? tgt - c : c - tgt;
  if (dist < 1.0 * R) return 0;
  st.pos = d; st.stop = st.S; st.tgt = tgt; st.eb = i;
  return d;
}
