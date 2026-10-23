export const meta = {
  "id": "c1022-crypto-04",
  "name": "Single extreme funding print fade (both sides)",
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
  "holdBars": 3,
  "params": {
    "th": 0.001,
    "hold": 3
  }
};

export function signal(bars, i, ctx) {
  const th = ctx.params.th;
  const fd = ctx.fundingRate(i) ?? 0;
  if (fd >= th) return -1;
  if (fd <= -th) return 1;
  return 0;
}
