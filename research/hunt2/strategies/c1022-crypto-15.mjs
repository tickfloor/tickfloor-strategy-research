export const meta = {
  "id": "c1022-crypto-15",
  "name": "Shorts building into negative funding: squeeze setup",
  "family": "carry",
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
  "holdBars": 7,
  "params": {
    "fWin": 3,
    "oiWin": 7,
    "oiUp": 0.1,
    "hold": 7
  }
};

function oicOf(k, bars, ctx) {
  const oi = ctx.openInterest(k);
  return oi === null ? null : oi / bars[k].close; // coin-denominated OI, null if unknown
}
export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.fd === undefined) st.fd = [];
  st.fd.push(ctx.fundingRate(i) ?? 0);
  if (st.fd.length > p.fWin) st.fd.shift();
  if (i < p.oiWin || st.fd.length < p.fWin) return 0;
  const cur = oicOf(i, bars, ctx), past = oicOf(i - p.oiWin, bars, ctx);
  if (cur === null || past === null) return 0;
  let sum = 0;
  for (const v of st.fd) sum += v;
  const d = cur / past - 1;
  return sum / p.fWin < 0 && d >= p.oiUp ? 1 : 0;
}
