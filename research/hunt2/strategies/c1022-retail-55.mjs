// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-55",
  "name": "Tillson T3(20) trend line",
  "family": "trend",
  "source": "c1022/retail",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "assets": [
    "AAPL",
    "NVDA",
    "AMZN",
    "GOOGL",
    "META",
    "TSLA",
    "JPM",
    "V",
    "UNH",
    "XOM",
    "JNJ",
    "COST",
    "ABBV",
    "MRK",
    "AVGO",
    "CVX",
    "WMT",
    "BAC",
    "ORCL",
    "ADBE",
    "CRM",
    "NFLX",
    "AMD",
    "INTC",
    "ABT",
    "MCD",
    "DIS",
    "QCOM",
    "TXN",
    "HON",
    "CAT",
    "LOW",
    "SBUX",
    "BA",
    "UPS",
    "PFE",
    "T",
    "MDT",
    "UNP",
    "MMM"
  ],
  "params": {
    "len": 20,
    "v": 0.7
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  const v = p.v;
  const a = 2 / (p.len + 1);
  if (st.e === undefined) { st.e = [null, null, null, null, null, null]; st.t3prev = NaN; st.pos = 0; }
  // six chained EMAs, each seeded with its first input value
  let x = bars[i].close;
  for (let k = 0; k < 6; k++) {
    st.e[k] = st.e[k] === null ? x : st.e[k] + a * (x - st.e[k]);
    x = st.e[k];
  }
  const e3 = st.e[2], e4 = st.e[3], e5 = st.e[4], e6 = st.e[5];
  const c1 = -(v * v * v);
  const c2 = 3 * v * v + 3 * v * v * v;
  const c3 = -6 * v * v - 3 * v - 3 * v * v * v;
  const c4 = 1 + 3 * v + v * v * v + 3 * v * v;
  const t3 = c1 * e6 + c2 * e5 + c3 * e4 + c4 * e3;
  const prev = st.t3prev;
  st.t3prev = t3;
  const c = bars[i].close;
  if (st.pos === 1) {
    if (c < t3) st.pos = 0;
  } else if (c > t3 && t3 > prev) {
    st.pos = 1;
  }
  return st.pos;
}
