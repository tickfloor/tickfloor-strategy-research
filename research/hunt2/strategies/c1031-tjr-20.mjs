// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-20). London session range break with displacement, held to 17:00 UTC. 1h crypto.
export const meta = {
  id: "c1031-tjr-20",
  name: "London drives New York: a London session that broke the Asia range with displacement continues through 12:00-17:00 UTC (crypto 1h)",
  family: "session_range",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { displacementATR: 2, closeFrac: 0.7, exitHour: 17 },
};

const dayOf = (t) => Math.floor(t / 86400);
const hourOf = (t) => Math.floor(t / 3600) % 24;

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) { st.pos = 0; st.mid = 0; }
  const b = bars[i], c = b.close, h = hourOf(b.time);

  if (st.pos !== 0) {
    const hit = (st.pos > 0 ? c < st.mid : c > st.mid) || h === p.exitHour;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }
  if (h !== 11) return 0;
  const A = ctx.atr(14);
  if (!(A > 0)) return 0;

  // Hours 0..11 of this UTC day are bars i-11..i. Verify the hours line up, or skip.
  const D = dayOf(b.time);
  let aH = -Infinity, aL = Infinity, lH = -Infinity, lL = Infinity, o7 = NaN;
  for (let k = i - 11; k <= i; k++) {
    if (k < 0 || dayOf(bars[k].time) !== D || hourOf(bars[k].time) !== k - (i - 11)) return 0;
    const bk = bars[k];
    if (k - (i - 11) < 7) { aH = Math.max(aH, bk.high); aL = Math.min(aL, bk.low); }
    else { lH = Math.max(lH, bk.high); lL = Math.min(lL, bk.low); if (hourOf(bk.time) === 7) o7 = bk.open; }
  }
  const ret = c - o7, rng = lH - lL;
  const mid = (lH + lL) / 2;

  if (lH > aH && lL >= aL && ret >= p.displacementATR * A && c >= lL + p.closeFrac * rng) {
    st.pos = 1; st.mid = mid; st.eb = i;
    return 1;
  }
  if (lL < aL && lH <= aH && ret <= -p.displacementATR * A && c <= lL + (1 - p.closeFrac) * rng) {
    st.pos = -1; st.mid = mid; st.eb = i;
    return -1;
  }
  return 0;
}
