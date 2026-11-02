// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-31). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-31",
  "name": "Participation regime: coin-OI/return correlation gates 10-day momentum",
  "family": "regime",
  "source": "c1031/cryptoderiv",
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
    "corr": 0.3,
    "momN": 10
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.rx === undefined) {
    st.rx = ctx.rolling(p.win); st.ry = ctx.rolling(p.win);
    st.rxy = ctx.rolling(p.win); st.rxx = ctx.rolling(p.win); st.ryy = ctx.rolling(p.win);
  }
  if (i < 1) return 0;
  const o1 = ctx.openInterest(i), o0 = ctx.openInterest(i - 1);
  if (o1 === null || o0 === null) return 0;
  const cNow = bars[i].close, cPrev = bars[i - 1].close;
  const x = cNow / cPrev - 1;
  const y = (o1 / cNow) / (o0 / cPrev) - 1; // coin-denominated OI change
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  st.rx.push(x); st.ry.push(y); st.rxy.push(x * y); st.rxx.push(x * x); st.ryy.push(y * y);
  if (!st.rx.full()) return 0;
  const mx = st.rx.mean(), my = st.ry.mean();
  const vx = st.rxx.mean() - mx * mx, vy = st.ryy.mean() - my * my;
  if (!(vx > 0) || !(vy > 0)) return 0;
  const rho = (st.rxy.mean() - mx * my) / Math.sqrt(vx * vy);
  const mom = cNow / bars[i - p.momN].close - 1;
  return rho >= p.corr && mom > 0 ? 1 : 0;
}
