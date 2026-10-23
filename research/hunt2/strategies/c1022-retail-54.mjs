// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-54",
  "name": "Linear regression channel: buy the -2 sigma line in a rising channel",
  "family": "mean_reversion",
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
    "len": 100,
    "sigma": 2,
    "maxHold": 20
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entryBar = -1; }
  const n = p.len;
  if (i < n - 1) return 0;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let k = 0; k < n; k++) {
    const y = bars[i - n + 1 + k].close;
    sx += k; sy += y; sxy += k * y; sxx += k * k;
  }
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const a = (sy - b * sx) / n;
  const fitEnd = a + b * (n - 1);
  let sse = 0;
  for (let k = 0; k < n; k++) {
    const r = bars[i - n + 1 + k].close - (a + b * k);
    sse += r * r;
  }
  // ponytail: sample std of residuals (n-1), same convention as ctx.rollingStd
  const s = Math.sqrt(sse / (n - 1));
  const c = bars[i].close;
  if (st.pos === 1) {
    if (c >= fitEnd || b <= 0 || i - st.entryBar >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (b > 0 && c < fitEnd - p.sigma * s) {
    st.pos = 1; st.entryBar = i;
  }
  return st.pos;
}
