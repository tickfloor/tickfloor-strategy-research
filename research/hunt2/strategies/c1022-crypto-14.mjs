export const meta = {
  "id": "c1022-crypto-14",
  "name": "Joint 30-day high in price and open interest, exit on 10% OI drawdown",
  "family": "trend",
  "source": "c1022/crypto",
  "assetClass": "crypto",
  "timeframe": "1d",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT"
  ],
  "params": {
    "win": 30,
    "oiDd": 0.1
  }
};

function oicOf(k, bars, ctx) {
  const oi = ctx.openInterest(k);
  return oi === null ? null : oi / bars[k].close; // coin-denominated OI, null if unknown
}
export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.peak = 0; }
  const cur = oicOf(i, bars, ctx);
  if (cur === null) { st.pos = 0; return 0; }
  if (st.pos === 1) {
    st.peak = Math.max(st.peak, cur);
    if (cur < st.peak * (1 - p.oiDd)) st.pos = 0;
    return st.pos;
  }
  if (i < p.win - 1) return 0;
  let closeMax = -Infinity, oiMax = -Infinity;
  for (let k = i - p.win + 1; k <= i; k++) {
    const o = oicOf(k, bars, ctx);
    if (o === null) return 0;
    oiMax = Math.max(oiMax, o);
    closeMax = Math.max(closeMax, bars[k].close);
  }
  if (bars[i].close === closeMax && cur === oiMax) { st.pos = 1; st.peak = cur; }
  return st.pos;
}
