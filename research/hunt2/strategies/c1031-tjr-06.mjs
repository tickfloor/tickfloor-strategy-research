// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-06). NY-open close beyond the London range, continuation.
export const meta = {
  id: "c1031-tjr-06",
  name: "NY-open close-through of the London range: continuation, exit when back inside, flat at 16:00 New York (crypto 1h)",
  family: "session_liquidity",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { londonStartHour: 7, closeBeyondATR: 0.25, flatBars: 6 },
};

// US daylight time for UTC day D: second Sunday of March <= D < first Sunday of November.
function isDst(t) {
  const y = new Date(t * 1000).getUTCFullYear();
  const firstSun = (m) => 1 + ((7 - new Date(Date.UTC(y, m, 1)).getUTCDay()) % 7);
  const start = Date.UTC(y, 2, firstSun(2) + 7) / 86400000;
  const end = Date.UTC(y, 10, firstSun(10)) / 86400000;
  const D = Math.floor(t / 86400);
  return D >= start && D < end;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars[i];
  if (st.pos === undefined) { st.pos = 0; st.lastDay = -1; st.lh = 0; st.ll = 0; }
  const D = Math.floor(b.time / 86400);
  const h = Math.floor(b.time / 3600) % 24;
  const NYH = isDst(b.time) ? 13 : 14;

  if (st.pos !== 0) {
    const exit = st.pos === 1 ? (b.close < st.lh || h === NYH + 6) : (b.close > st.ll || h === NYH + 6);
    if (exit) st.pos = 0;
    return st.pos;
  }
  if (h !== NYH || st.lastDay === D) return 0; // decide only on the NY open bar, once per UTC day

  const A = ctx.atr(14, i);
  if (!(A > 0)) return 0;
  // London range: 1h bars with hour londonStartHour..NYH-1 of day D, all must exist
  let lh = -Infinity, ll = Infinity;
  for (let hh = p.londonStartHour; hh < NYH; hh++) {
    const k = i - (NYH - hh);
    if (k < 0 || bars[k].time !== D * 86400 + hh * 3600) return 0;
    lh = Math.max(lh, bars[k].high);
    ll = Math.min(ll, bars[k].low);
  }
  let dir = 0;
  if (b.close > lh + p.closeBeyondATR * A) dir = 1;
  else if (b.close < ll - p.closeBeyondATR * A) dir = -1;
  if (dir === 0) return 0;
  st.pos = dir; st.lh = lh; st.ll = ll; st.lastDay = D;
  return dir;
}
