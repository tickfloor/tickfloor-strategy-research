// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-57",
  "name": "Landry three-bar pullback in a rising 50-day SMA",
  "family": "momentum",
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
    "sma": 50,
    "pullbackBars": 3,
    "targetR": 2,
    "maxHold": 15
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.stop = NaN; st.entry = NaN; st.entryBar = -1; }
  const b = bars[i];
  if (st.pos === 1) {
    if (b.close < st.stop || b.close >= st.entry + p.targetR * (st.entry - st.stop) || i - st.entryBar >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (i < 5) return 0;
  const m = ctx.sma("close", p.sma, i);
  const mPrev = ctx.sma("close", p.sma, i - 5);
  if (!(b.close > m && m > mPrev)) return 0;
  // pullback: the run of consecutive bars ending at i-1 whose high is lower than the prior bar's high
  let k = i - 1, run = 0;
  while (k >= 1 && bars[k].high < bars[k - 1].high) { run++; k--; }
  if (run < p.pullbackBars) return 0;
  let stop = Infinity;
  for (let j = k + 1; j <= i - 1; j++) if (bars[j].low < stop) stop = bars[j].low;
  if (!(b.close > bars[i - 1].high)) return 0;
  st.pos = 1; st.entry = b.close; st.stop = stop; st.entryBar = i;
  return 1;
}
