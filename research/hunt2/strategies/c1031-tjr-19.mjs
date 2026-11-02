// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-19). 48h-extreme sweep with an open-interest flush.
export const meta = {
  id: "c1031-tjr-19",
  name: "Sweep of a 48-hour extreme with an open-interest flush: fade the stop run once leveraged positions have been liquidated (crypto 1h)",
  family: "liquidity_sweep",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { lookback: 48, overshootATR: 0.05, oiBars: 3, oiDrop: -0.01, rMin: 0.3, rMax: 4, targetR: 2, maxHold: 24 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) { st.pos = 0; st.stop = 0; st.tgt = 0; st.held = 0; }
  const c = b[i].close;
  if (st.pos !== 0) {
    st.held++;
    const exit = st.pos === 1
      ? (c <= st.stop || c >= st.tgt || st.held >= p.maxHold)
      : (c >= st.stop || c <= st.tgt || st.held >= p.maxHold);
    if (exit) st.pos = 0;
    return st.pos;
  }

  const A = ctx.atr(14, i);
  if (!(A > 0) || i < p.lookback + p.oiBars) return 0;
  const oi = ctx.openInterest(i), oi0 = ctx.openInterest(i - p.oiBars);
  if (oi === null || oi0 === null) return 0;
  const oiChg = oi / oi0 - 1;

  let m = Infinity, M = -Infinity;
  for (let k = i - p.lookback; k <= i - 1; k++) {
    m = Math.min(m, b[k].low);
    M = Math.max(M, b[k].high);
  }
  const longGo = b[i].low < m - p.overshootATR * A && c > m && oiChg <= p.oiDrop;
  const shortGo = b[i].high > M + p.overshootATR * A && c < M && oiChg <= p.oiDrop;
  if (longGo === shortGo) return 0; // neither, or both: skip

  const dir = longGo ? 1 : -1;
  const stop = longGo ? b[i].low : b[i].high;
  const R = Math.abs(c - stop);
  if (R < p.rMin * A || R > p.rMax * A) return 0;
  st.pos = dir; st.stop = stop; st.tgt = c + dir * p.targetR * R; st.held = 0;
  return dir;
}
