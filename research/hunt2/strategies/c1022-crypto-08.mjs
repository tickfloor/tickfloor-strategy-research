export const meta = {
  "id": "c1022-crypto-08",
  "name": "Funding pinned at the clamp = no leverage interest, trade the ensuing 20-day breakout",
  "family": "volatility",
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
  "holdBars": 10,
  "params": {
    "win": 30,
    "pinned": 0.0001,
    "tol": 5e-06,
    "minFrac": 0.8,
    "don": 20,
    "hold": 10
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.fd === undefined) st.fd = [];
  st.fd.push(ctx.fundingRate(i));
  if (st.fd.length > p.win) st.fd.shift();
  if (st.fd.includes(null)) return 0; // any needed funding null -> 0 (spec)
  if (st.fd.length < p.win || i < 1) return 0;
  let hits = 0;
  for (const v of st.fd) if (Math.abs(v - p.pinned) <= p.tol) hits++;
  if (hits / p.win < p.minFrac) return 0;
  return bars[i].close > ctx.donchian(p.don, i - 1).upper ? 1 : 0;
}
