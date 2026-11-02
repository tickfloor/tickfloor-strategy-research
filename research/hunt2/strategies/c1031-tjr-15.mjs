// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-15). Daily profile: manipulation-only day, reversal next day.
export const meta = {
  id: "c1031-tjr-15",
  name: "Daily profile 'manipulation only': a day that ran the previous extreme and closed beyond it reverses the next day (crypto 1h)",
  family: "daily_profile",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { closeFrac: 0.25, minRangeFrac: 0.5, rangeDays: 14 },
};

// UTC day D-k containing bar i (hour 23): high/low/close over its 24 hourly bars, null if any is missing.
function dayStats(bars, i, k) {
  const s = i - 23 - 24 * k;
  if (s < 0) return null;
  const D = Math.floor(bars[i].time / 86400) - k;
  let hi = -Infinity, lo = Infinity;
  for (let q = 0; q < 24; q++) {
    const x = bars[s + q];
    if (x.time !== D * 86400 + q * 3600) return null;
    hi = Math.max(hi, x.high);
    lo = Math.min(lo, x.low);
  }
  return { hi, lo, cl: bars[s + 23].close };
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; }
  if (st.pos !== 0) {
    st.held++;
    if (st.held >= 24) st.pos = 0; // close of the hour-23 bar of day D+1
    return st.pos;
  }
  if (Math.floor(bars[i].time / 3600) % 24 !== 23) return 0; // decide on the completed day only

  const d = dayStats(bars, i, 0);
  if (!d) return 0;
  const pd = dayStats(bars, i, 1);
  if (!pd) return 0;
  let sum = 0;
  for (let k = 1; k <= p.rangeDays; k++) {
    const r = dayStats(bars, i, k);
    if (!r) return 0;
    sum += r.hi - r.lo;
  }
  const rangeAvg = sum / p.rangeDays, R = d.hi - d.lo;
  if (R < p.minRangeFrac * rangeAvg) return 0;

  const longGo = d.lo < pd.lo && d.cl < pd.lo && d.cl <= d.lo + p.closeFrac * R;
  const shortGo = d.hi > pd.hi && d.cl > pd.hi && d.cl >= d.hi - p.closeFrac * R;
  if (longGo === shortGo) return 0; // neither, or both: skip
  st.pos = longGo ? 1 : -1; st.held = 0;
  return st.pos;
}
