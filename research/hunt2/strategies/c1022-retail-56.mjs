// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-56",
  "name": "ALMA 9/50 crossover",
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
    "fast": 9,
    "slow": 50,
    "offset": 0.85,
    "sigma": 6
  }
};

function alma(bars, i, n, offset, sigma) {
  const m = offset * (n - 1);
  const s = n / sigma;
  let num = 0, den = 0;
  for (let k = 0; k < n; k++) {
    const d = k - m;
    const w = Math.exp(-(d * d) / (2 * s * s));
    num += w * bars[i - (n - 1) + k].close;
    den += w;
  }
  return num / den;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.prevDiff = NaN; }
  if (i < p.slow - 1) return st.pos;
  const diff = alma(bars, i, p.fast, p.offset, p.sigma) - alma(bars, i, p.slow, p.offset, p.sigma);
  const prev = st.prevDiff;
  st.prevDiff = diff;
  if (prev >= 0 && diff < 0) st.pos = 0;
  else if (prev <= 0 && diff > 0) st.pos = 1;
  return st.pos;
}
