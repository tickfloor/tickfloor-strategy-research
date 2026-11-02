// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-06). Blume, Easley & O'Hara 1994, Journal of Finance 49(1), 153-181; Gencay & Stengos 1998, Journal of Forecasting 17(5-6), 401-414
export const meta = {
  id: "c1031-acad4-06",
  name: "Volume-augmented moving average rule: close above the 50-day average while 10-day volume exceeds 50-day volume, 13 equity ETFs",
  family: "trend",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: false,
  params: { priceMA: 50, volShort: 10, volLong: 50 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.priceMA + 1) return 0;
  return bars[i].close > ctx.sma("close", p.priceMA, i) && ctx.sma("volume", p.volShort, i) > ctx.sma("volume", p.volLong, i) ? 1 : 0;
}
