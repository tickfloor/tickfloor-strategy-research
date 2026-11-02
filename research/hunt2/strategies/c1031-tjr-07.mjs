// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-07). Previous-week high/low sweep, hourly BOS, prior daily extreme target. 1h crypto.
export const meta = {
  id: "c1031-tjr-07",
  name: "Previous-week high/low sweep confirmed by an hourly BOS, target the prior daily extreme (crypto 1h)",
  family: "liquidity_sweep",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { overshootATR: 0.05, confirmBars: 12, preBars: 6, rMin: 0.5, rMax: 8, minRR: 1, maxHold: 120 },
};

const dayOf = (t) => Math.floor(t / 86400);
const weekOf = (t) => Math.floor((dayOf(t) + 3) / 7); // Monday = start of week (UTC)

// Previous UTC day's high/low, relative to the day containing bar s.
function prevDay(bars, s) {
  const d = dayOf(bars[s].time) - 1;
  let hi = -Infinity, lo = Infinity, n = 0;
  for (let k = s; k >= 0; k--) {
    const dk = dayOf(bars[k].time);
    if (dk > d) continue;
    if (dk < d) break;
    hi = Math.max(hi, bars[k].high); lo = Math.min(lo, bars[k].low); n++;
  }
  return n ? { hi, lo } : null;
}

// Sweep at bar s: dir -1 short (PWH swept), +1 long (PWL swept). BOS level = extreme over s-preBars..s.
function newPend(bars, s, d, p) {
  let lvl = d < 0 ? Infinity : -Infinity;
  for (let k = s - p.preBars; k <= s; k++) lvl = d < 0 ? Math.min(lvl, bars[k].low) : Math.max(lvl, bars[k].high);
  return { dir: d, s, lvl, ext: d < 0 ? bars[s].high : bars[s].low };
}

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.pos === undefined) {
    st.pos = 0; st.eb = 0; st.stop = 0; st.tgt = 0;
    st.wk = null; st.cH = 0; st.cL = 0; st.cN = 0; st.pH = NaN; st.pL = NaN; st.pOK = false;
    st.sideS = false; st.sideL = false; st.pend = [];
  }
  const b = bars[i], c = b.close;

  // Weekly bookkeeping: previous week's levels are valid only if that week had all 168 hourly bars.
  const wk = weekOf(b.time);
  if (wk !== st.wk) {
    if (st.wk !== null) { st.pH = st.cH; st.pL = st.cL; st.pOK = st.cN === 168; }
    st.wk = wk; st.cH = b.high; st.cL = b.low; st.cN = 0;
    st.sideS = false; st.sideL = false; st.pend = [];
  }
  st.cH = Math.max(st.cH, b.high); st.cL = Math.min(st.cL, b.low); st.cN++;

  // Pending BOS windows run on every bar (their extremes must include bars while in a trade).
  let entry = null;
  const keep = [];
  for (const P of st.pend) {
    if (i > P.s + p.confirmBars) continue;
    P.ext = P.dir < 0 ? Math.max(P.ext, b.high) : Math.min(P.ext, b.low);
    const bos = P.dir < 0 ? c < P.lvl : c > P.lvl;
    if (!bos) { keep.push(P); continue; }
    // BOS fired: this setup is consumed whether or not it passes the size and target checks.
    const A = ctx.atr(14);
    const R = P.dir < 0 ? P.ext - c : c - P.ext;
    if (!(A > 0) || !(R >= p.rMin * A && R <= p.rMax * A)) continue;
    const pd = prevDay(bars, P.s);
    if (!pd) continue;
    const tgt = P.dir < 0 ? pd.lo : pd.hi;
    const dist = P.dir < 0 ? c - tgt : tgt - c;
    if (dist < p.minRR * R) continue;
    if (!entry) entry = { dir: P.dir, stop: P.ext, tgt };
  }
  st.pend = keep;

  // First sweep of PWH/PWL per side this week. A sweep seen while in a trade is an ignored setup but still consumes the side.
  const A = ctx.atr(14);
  if (st.pOK && A > 0) {
    if (!st.sideS && b.high > st.pH + p.overshootATR * A && c < st.pH) { st.sideS = true; if (st.pos === 0) st.pend.push(newPend(bars, i, -1, p)); }
    if (!st.sideL && b.low < st.pL - p.overshootATR * A && c > st.pL) { st.sideL = true; if (st.pos === 0) st.pend.push(newPend(bars, i, 1, p)); }
  }

  if (st.pos !== 0) {
    const hit = st.pos < 0
      ? c >= st.stop || c <= st.tgt || i - st.eb >= p.maxHold
      : c <= st.stop || c >= st.tgt || i - st.eb >= p.maxHold;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }

  if (entry) {
    st.pos = entry.dir; st.stop = entry.stop; st.tgt = entry.tgt; st.eb = i;
    st.pend = [];
    return st.pos;
  }
  return 0;
}
