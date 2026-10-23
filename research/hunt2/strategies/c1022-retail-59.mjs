// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-59",
  "name": "New York open range breakout on hourly crypto",
  "family": "volatility",
  "source": "c1022/retail",
  "assetClass": "crypto",
  "timeframe": "1h",
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
    "rangeHoursUTC": [
      13,
      14
    ],
    "entryHoursUTC": [
      15,
      18
    ],
    "exitHourUTC": 20
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  const b = bars[i];
  if (st.day === undefined) { st.day = null; st.pos = 0; st.traded = false; st.rHi = -Infinity; st.rLo = Infinity; }
  const day = Math.floor(b.time / 86400);
  if (day !== st.day) { st.day = day; st.pos = 0; st.traded = false; st.rHi = -Infinity; st.rLo = Infinity; }
  const h = Math.floor(b.time / 3600) % 24;
  const [r0, r1] = p.rangeHoursUTC;
  const [e0, e1] = p.entryHoursUTC;
  if (h >= r0 && h <= r1) {
    st.rHi = Math.max(st.rHi, b.high);
    st.rLo = Math.min(st.rLo, b.low);
    return st.pos;
  }
  if (st.pos === 1) {
    if (b.close < st.rLo || h === p.exitHourUTC) st.pos = 0;
    return st.pos;
  }
  if (h >= e0 && h <= e1 && !st.traded && Number.isFinite(st.rHi) && b.close > st.rHi) {
    st.pos = 1; st.traded = true;
  }
  return st.pos;
}
