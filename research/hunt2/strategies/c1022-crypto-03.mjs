export const meta = {
  "id": "c1022-crypto-03",
  "name": "Funding persistence: sustained premium streak as trend confirmation",
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
    "base": 0.0001,
    "streak": 7,
    "exitDays": 3
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.up === undefined) { st.up = 0; st.down = 0; st.pos = 0; }
  if ((ctx.fundingRate(i) ?? 0) > p.base) { st.up += 1; st.down = 0; }
  else { st.down += 1; st.up = 0; }
  if (st.up >= p.streak) st.pos = 1;
  else if (st.down >= p.exitDays) st.pos = 0;
  return st.pos;
}
