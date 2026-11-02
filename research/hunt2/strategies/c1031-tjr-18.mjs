export const meta = {
  id: "c1031-tjr-18",
  name: "Weekly equilibrium magnet: a week closing in the top/bottom quarter of its range reverts toward the weekly 50% next week (crypto 1h)",
  family: "premium_discount",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { closeFrac: 0.25, minRangeATR: 10, maxHold: 96 },
};

// Decision only on the Sunday 23:00 UTC bar, which closes the 168-bar week (Monday 00:00 to Sunday 23:00).
export function signal(bars, i, ctx) {
  const st = ctx.state;
  const P = ctx.params;
  if (st.pos === undefined) { st.pos = 0; st.entry = 0; st.tgt = 0; st.stop = 0; }
  const bar = bars[i];

  if (st.pos !== 0) {
    const held = i - st.entry;
    const hit = st.pos === -1
      ? (bar.close <= st.tgt || bar.close > st.stop)
      : (bar.close >= st.tgt || bar.close < st.stop);
    if (hit || held >= P.maxHold) { st.pos = 0; return 0; }
    return st.pos;
  }

  const dow = (Math.floor(bar.time / 86400) + 3) % 7;
  const hour = Math.floor(bar.time / 3600) % 24;
  if (dow !== 6 || hour !== 23 || i < 167) return 0;
  if (bars[i - 167].time !== bar.time - 167 * 3600) return 0;
  const A = ctx.atr(14, i);
  if (Number.isNaN(A)) return 0;

  let wHigh = -Infinity, wLow = Infinity;
  for (let k = i - 167; k <= i; k++) {
    if (bars[k].high > wHigh) wHigh = bars[k].high;
    if (bars[k].low < wLow) wLow = bars[k].low;
  }
  const range = wHigh - wLow;
  if (range < P.minRangeATR * A) return 0;
  const wMid = (wHigh + wLow) / 2;
  const wClose = bar.close;

  if (wClose >= wLow + (1 - P.closeFrac) * range) {
    st.pos = -1; st.entry = i; st.tgt = wMid; st.stop = wHigh;
    return -1;
  }
  if (wClose <= wLow + P.closeFrac * range) {
    st.pos = 1; st.entry = i; st.tgt = wMid; st.stop = wLow;
    return 1;
  }
  return 0;
}
