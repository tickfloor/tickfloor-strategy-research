export const meta = {
  id: "c1031-tjr-14",
  name: "Daily profile 'manipulation + reversal' continuation: a day that swept the previous extreme and closed in the opposite quarter continues next day (crypto 1h)",
  family: "daily_profile",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { closeFrac: 0.25, minRangeFrac: 0.5, rangeDays: 14 },
};

// Daily aggregates keyed by UTC day number. A day is complete with 24 hourly bars.
export function signal(bars, i, ctx) {
  const st = ctx.state;
  const P = ctx.params;
  if (st.dd === undefined) { st.dd = {}; st.pos = 0; st.entry = 0; }
  const bar = bars[i];
  const day = Math.floor(bar.time / 86400);
  const hour = Math.floor(bar.time / 3600) % 24;
  const d = st.dd[day];
  if (d === undefined) st.dd[day] = { hi: bar.high, lo: bar.low, cl: bar.close, n: 1 };
  else { if (bar.high > d.hi) d.hi = bar.high; if (bar.low < d.lo) d.lo = bar.low; d.cl = bar.close; d.n++; }

  if (st.pos !== 0) {
    if (i - st.entry >= 24) { st.pos = 0; return 0; }
    return st.pos;
  }
  if (hour !== 23) return 0;

  const cur = st.dd[day];
  const prev = st.dd[day - 1];
  if (cur.n !== 24 || prev === undefined || prev.n !== 24) return 0;
  let rangeSum = 0;
  for (let k = 1; k <= P.rangeDays; k++) {
    const x = st.dd[day - k];
    if (x === undefined || x.n !== 24) return 0;
    rangeSum += x.hi - x.lo;
  }
  const rangeAvg = rangeSum / P.rangeDays;
  const range = cur.hi - cur.lo;
  if (range < P.minRangeFrac * rangeAvg) return 0;

  const long = cur.lo < prev.lo && cur.cl > prev.lo && cur.cl >= cur.lo + (1 - P.closeFrac) * range;
  const short = cur.hi > prev.hi && cur.cl < prev.hi && cur.cl <= cur.hi - (1 - P.closeFrac) * range;
  if (long === short) return 0;
  st.pos = long ? 1 : -1;
  st.entry = i;
  return st.pos;
}
