// c1031-intraday-31: Fibonacci 61.8% retracement entry inside a 168-hour swing (stop at the swing end, target at the far end).
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-31",
  name: "Fibonacci 61.8% retracement entry inside a 168-hour swing",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { swingBars: 168, fib: 0.618, minSwingAtr: 4, maxHold: 48 },
};

// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const { swingBars: W, fib, minSwingAtr, maxHold } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = 0; st.stop = 0; st.target = 0; }
  const c = bars[i].close;
  if (st.pos !== 0) {
    const hit = st.pos === 1 ? c >= st.target || c < st.stop : c <= st.target || c > st.stop;
    if (hit || i - st.entry >= maxHold) { st.pos = 0; return 0; }
    return st.pos;
  }
  const j = i - 1; // the swing window is bars i-168..i-1
  if (!contig(bars, i, W)) return 0; // bars i-168..i-1 (window) are consecutive
  let SH = -Infinity;
  let SL = Infinity;
  let tH = -1;
  let tL = -1;
  for (let k = j - W + 1; k <= j; k++) {
    if (bars[k].high >= SH) { SH = bars[k].high; tH = k; } // latest bar of the max high
    if (bars[k].low <= SL) { SL = bars[k].low; tL = k; } // latest bar of the min low
  }
  const a = ctx.atr(24, j);
  const swing = SH - SL;
  if (!(swing >= minSwingAtr * a)) return 0;
  const bar = bars[i];
  if (tH > tL) {
    const level = SH - fib * swing;
    if (bar.low <= level && c > level && c > SL) {
      st.pos = 1; st.entry = i; st.stop = SL; st.target = SH;
      return 1;
    }
  } else if (tL > tH) {
    const level = SL + fib * swing;
    if (bar.high >= level && c < level && c < SH) {
      st.pos = -1; st.entry = i; st.stop = SH; st.target = SL;
      return -1;
    }
  }
  return 0;
}
