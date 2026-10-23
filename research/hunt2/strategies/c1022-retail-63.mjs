// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-63",
  "name": "Donchian 20 breakout with a 1.618 Fibonacci extension target",
  "family": "trend",
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
    "entry": 20,
    "swingLookback": 20,
    "ext": 1.618,
    "maxHold": 60
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.target = NaN; st.stop = NaN; st.entryBar = -1; }
  const b = bars[i];
  if (st.pos === 1) {
    if (b.close >= st.target || b.close < st.stop || i - st.entryBar >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (i < p.entry) return 0;
  if (!(b.close > ctx.donchian(p.entry, i - 1).upper)) return 0;
  const swingLow = ctx.donchian(p.swingLookback, i - 1).lower;
  st.target = swingLow + p.ext * (b.close - swingLow);
  st.stop = swingLow;
  st.entryBar = i;
  st.pos = 1;
  return 1;
}
