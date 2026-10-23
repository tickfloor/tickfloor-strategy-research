// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-53",
  "name": "Percent envelope (SMA20, 10%) lower-band buy",
  "family": "mean_reversion",
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
  "params": {
    "sma": 20,
    "pct": 0.1
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const m = ctx.sma("close", ctx.params.sma, i);
  const c = bars[i].close;
  if (st.pos === 1) {
    if (c >= m) st.pos = 0;
  } else if (c < m * (1 - ctx.params.pct)) {
    st.pos = 1;
  }
  return st.pos;
}
