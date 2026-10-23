// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-06). Frozen before code.
export const meta = {
  id: "c1022-retail-06",
  name: "Weekly RSI > 50 trend, daily RSI 40 pullback (multi-timeframe RSI)",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: {"rsi": 14, "weeklyMid": 50, "dailyPullback": 40, "dailyExit": 70},
};

// Wilder RSI on an arbitrary series (here: weekly closes), fed once per new complete week.
function wilderStep(st, x, n) {
  if (st.prev !== undefined) {
    const ch = x - st.prev;
    const g = ch > 0 ? ch : 0, l = ch < 0 ? -ch : 0;
    st.cnt++;
    if (st.cnt <= n) {
      st.g += g; st.l += l;
      if (st.cnt === n) { st.g /= n; st.l /= n; }
    } else {
      st.g = (st.g * (n - 1) + g) / n;
      st.l = (st.l * (n - 1) + l) / n;
    }
    if (st.cnt >= n) st.rsi = st.l === 0 ? 100 : 100 - 100 / (1 + st.g / st.l);
  }
  st.prev = x;
}

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) {
    s.pos = 0;
    s.w = { g: 0, l: 0, cnt: 0, rsi: NaN, nc: 0, prev: undefined };
  }
  const W = ctx.resample(bars, "1w");
  const nc = W.length && W[W.length - 1].complete ? W.length : W.length - 1;
  let changed = false;
  while (s.w.nc < nc) {
    wilderStep(s.w, W[s.w.nc].close, 14);
    s.w.nc++;
    changed = true;
  }
  const wr = s.w.rsi;
  const d = ctx.rsi(14, i), dp = i > 0 ? ctx.rsi(14, i - 1) : NaN;
  if (s.pos === 1) {
    if (d > 70 || (changed && wr < 50)) s.pos = 0;
  } else if (wr > 50 && dp < 40 && d >= 40) {
    s.pos = 1;
  }
  return s.pos;
}
