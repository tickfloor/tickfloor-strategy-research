export const meta = {
  "id": "c1022-crypto-06",
  "name": "Funding z-score reversion gated to low realised volatility",
  "family": "mean_reversion",
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
    "TRXUSDT",
    "BCHUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "DASHUSDT",
    "ZECUSDT",
    "AVAXUSDT",
    "UNIUSDT",
    "NEARUSDT",
    "AAVEUSDT",
    "HBARUSDT"
  ],
  "longShort": true,
  "holdBars": 5,
  "params": {
    "zWin": 180,
    "z": 1.5,
    "volWin": 30,
    "volPct": 0.33,
    "volHist": 365,
    "hold": 5
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.fd === undefined) { st.fd = []; st.rv = []; }
  const fd = ctx.fundingRate(i);
  if (fd !== null) { st.fd.push(fd); if (st.fd.length > p.zWin) st.fd.shift(); } // nulls never enter the window
  const rv = ctx.rollingStd("ret", p.volWin, i);
  // lowVol: rv below the volPct quantile of the prior volHist rv values
  let lowVol = false;
  if (Number.isFinite(rv) && st.rv.length === p.volHist) {
    const sorted = [...st.rv].sort((a, b) => a - b);
    lowVol = rv < sorted[Math.floor(p.volPct * sorted.length)];
  }
  if (Number.isFinite(rv)) {
    st.rv.push(rv);
    if (st.rv.length > p.volHist) st.rv.shift();
  }
  if (fd === null || !lowVol || st.fd.length < p.zWin) return 0; // null funding -> 0 (spec)
  const n = st.fd.length;
  let mean = 0;
  for (const v of st.fd) mean += v;
  mean /= n;
  let ss = 0;
  for (const v of st.fd) ss += (v - mean) ** 2;
  const sd = Math.sqrt(ss / (n - 1));
  const z = sd > 0 ? (st.fd[n - 1] - mean) / sd : 0;
  if (z >= p.z) return -1;
  if (z <= -p.z) return 1;
  return 0;
}
