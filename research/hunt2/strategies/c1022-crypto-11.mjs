export const meta = {
  "id": "c1022-crypto-11",
  "name": "Open-interest trough inside a price uptrend (deleveraged trend has room)",
  "family": "other",
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
  "holdBars": 15,
  "params": {
    "oiWin": 60,
    "sma": 100,
    "hold": 15
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.ring === undefined) st.ring = [];
  const oi = ctx.openInterest(i);
  if (oi === null) return 0; // null is never pushed into the window
  const oic = oi / bars[i].close;
  const newLow = st.ring.length === p.oiWin && oic <= Math.min(...st.ring); // prior ring only
  st.ring.push(oic);
  if (st.ring.length > p.oiWin) st.ring.shift();
  return newLow && bars[i].close > ctx.sma("close", p.sma, i) ? 1 : 0;
}
