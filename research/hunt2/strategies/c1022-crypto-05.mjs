export const meta = {
  "id": "c1022-crypto-05",
  "name": "Carry-adjusted momentum: 28-day return net of cumulative funding paid",
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
  "params": {
    "lb": 28,
    "settlementsPerDay": 3
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.fd === undefined) st.fd = [];
  const fd = ctx.fundingRate(i);
  st.fd.push(fd);
  if (st.fd.length > p.lb) st.fd.shift();
  if (i < p.lb || st.fd.includes(null)) return 0; // any needed funding null -> 0 (spec)
  const r = bars[i].close / bars[i - p.lb].close - 1;
  let c = 0;
  for (const v of st.fd) c += v * p.settlementsPerDay;
  return r - c > 0 && c < 0.05 ? 1 : 0;
}
