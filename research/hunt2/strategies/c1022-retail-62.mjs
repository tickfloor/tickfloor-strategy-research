// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-62",
  "name": "Previous-week-high breakout with previous-week-low exit",
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
    "week": "prior complete UTC week"
  }
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const W = ctx.resample(bars, "1w");
  let last = null;
  for (let j = W.length - 1; j >= 0; j--) {
    if (W[j].complete) { last = W[j]; break; }
  }
  if (last === null) return st.pos;
  const c = bars[i].close;
  if (st.pos === 1) {
    if (c < last.low) st.pos = 0;
  } else if (c > last.high) {
    st.pos = 1;
  }
  return st.pos;
}
