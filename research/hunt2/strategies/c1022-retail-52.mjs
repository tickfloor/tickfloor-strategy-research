// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-52",
  "name": "OBV above its 20-day average with price above the 50-day SMA (Granville)",
  "family": "trend",
  "source": "c1022/retail",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "XLK",
    "XLF",
    "XLE",
    "XLV",
    "XLI",
    "XLP",
    "XLY",
    "XLU",
    "XLB",
    "XLC",
    "VNQ",
    "TLT",
    "IEF",
    "SHY",
    "LQD",
    "HYG",
    "AGG",
    "GLD",
    "SLV",
    "USO",
    "UNG",
    "DBC",
    "UUP"
  ],
  "params": {
    "obvSma": 20,
    "priceSma": 50
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.obv === undefined) { st.obv = 0; st.w = ctx.rolling(p.obvSma); st.pos = 0; }
  const b = bars[i];
  if (i > 0) {
    const pc = bars[i - 1].close;
    if (b.close > pc) st.obv += b.volume;
    else if (b.close < pc) st.obv -= b.volume;
  }
  st.w.push(st.obv);
  if (!st.w.full()) return st.pos;
  const obvSma = st.w.mean();
  if (st.pos === 1) {
    if (st.obv < obvSma) st.pos = 0;
  } else if (st.obv > obvSma && b.close > ctx.sma("close", p.priceSma, i)) {
    st.pos = 1;
  }
  return st.pos;
}
