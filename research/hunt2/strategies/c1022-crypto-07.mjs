export const meta = {
  "id": "c1022-crypto-07",
  "name": "Funding-price divergence: rally that shorts keep fighting",
  "family": "momentum",
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
  "holdBars": 7,
  "params": {
    "lb": 14,
    "minRet": 0.1,
    "hold": 7
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.fd === undefined) st.fd = [];
  st.fd.push(ctx.fundingRate(i));
  if (st.fd.length > p.lb) st.fd.shift();
  if (st.fd.includes(null)) return 0; // any needed funding null -> 0 (spec)
  if (i < p.lb) return 0;
  const r = bars[i].close / bars[i - p.lb].close - 1;
  let sum = 0;
  for (const v of st.fd) sum += v;
  return r >= p.minRet && sum / p.lb < 0 ? 1 : 0;
}
