// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-02). Source: Sentana & Wadhwani 1992, 'Feedback traders and stock return autocorrelations: evidence fro
export const meta = {
  id: "c1031-acad4-02",
  name: "Volatility-conditioned index autocorrelation: continue moves in calm regimes, reverse them in turbulent regimes, 13 equity ETFs (Sentana-Wadhwani)",
  family: "mean_reversion",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: true,
  params: { shortWin: 21, longWin: 252, minMove: 0.005 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 253) return 0;
  const r = bars[i].close / bars[i - 1].close - 1;
  if (Math.abs(r) < p.minMove) return 0;
  const calm = ctx.rollingStd("ret", p.shortWin, i) < ctx.rollingStd("ret", p.longWin, i);
  return calm ? Math.sign(r) : -Math.sign(r);
}
