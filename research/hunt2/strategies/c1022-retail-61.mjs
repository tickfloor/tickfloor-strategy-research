// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-61",
  "name": "Previous-day-high close-through continuation",
  "family": "momentum",
  "source": "c1022/retail",
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
  "holdBars": 2,
  "params": {
    "holdBars": 2
  }
};

export function signal(bars, i, ctx) {
  if (i < 1) return 0;
  const b = bars[i];
  return b.close > bars[i - 1].high && b.close > b.open ? 1 : 0;
}
