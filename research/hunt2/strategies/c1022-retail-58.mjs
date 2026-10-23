// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-58",
  "name": "200-day EMA touch-and-hold in an established uptrend",
  "family": "mean_reversion",
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
    "ema": 200,
    "trendBars": 20,
    "touchTol": 0.01,
    "stop": 0.03,
    "target": 0.1,
    "maxHold": 40
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = NaN; st.entryBar = -1; }
  const b = bars[i];
  const e = ctx.ema("close", p.ema, i);
  if (st.pos === 1) {
    if (b.close < e * (1 - p.stop) || b.close >= st.entry * (1 + p.target) || i - st.entryBar >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (i < p.trendBars - 1) return 0;
  for (let k = i - p.trendBars + 1; k <= i; k++) {
    if (!(bars[k].close > ctx.ema("close", p.ema, k))) return 0;
  }
  if (!(b.low <= e * (1 + p.touchTol) && b.close > e)) return 0;
  st.pos = 1; st.entry = b.close; st.entryBar = i;
  return 1;
}
