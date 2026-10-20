export const meta = {
  "id": "st-trend-comm-base",
  "name": "Steelman trend comm ungated (close>SMA50)",
  "family": "steelman-1004",
  "source": "steelman-1004 PREREG (Reddit commenters, day-1004/haiku)",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "GLD",
    "SLV",
    "USO",
    "UNG",
    "DBC"
  ],
  "params": {
    "sma": 50,
    "regimeSma": 200,
    "slopeLag": 20,
    "gated": false
  }
};

export function signal(bars, i, ctx) {
  if (i < 220) return 0;
  const c = bars[i].close;
  const s50 = ctx.sma("close", 50), s200 = ctx.sma("close", 200), s200p = ctx.sma("close", 200, i - 20);
  if (!(s50 > 0 && s200 > 0 && s200p > 0)) return 0;
  const trend = c > s50;
  if (!ctx.params.gated) return trend ? 1 : 0;
  return trend && c > s200 && s200 > s200p ? 1 : 0;
}
