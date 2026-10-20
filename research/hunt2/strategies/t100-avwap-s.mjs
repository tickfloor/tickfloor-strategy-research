// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-avwap-s",
  "name": "Anchored VWAP from the lowest close of the last 126 days: long while close is above it (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "AVWAP listed among the five most-used indicators (search result); r/Daytrading VWAP threads; YouTube VWAP videos 82.8K views",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n": 126
  },
  "warmup": 125
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const N = P.n;
  if (i < N) return 0;
  let lo = Infinity, ai = i;
  for (let k = i - N + 1; k <= i; k++) if (bars[k].close < lo) { lo = bars[k].close; ai = k; }
  let pv = 0, v = 0;
  for (let k = ai; k <= i; k++) { pv += ((bars[k].high + bars[k].low + bars[k].close) / 3) * bars[k].volume; v += bars[k].volume; }
  return v > 0 && b.close > pv / v ? 1 : 0;
}
