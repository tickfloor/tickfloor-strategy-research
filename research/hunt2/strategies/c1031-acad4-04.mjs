// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-04). Fixed-length-holding moving-average band breakout (FMA variant), 13 equity ETFs
export const meta = {
  id: "c1031-acad4-04",
  name: "Fixed-length MA band breakout: 1% band above SMA50, 10-bar hold, 13 equity ETFs",
  family: "trend",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: false,
  holdBars: 10,
  params: { maLen: 50, band: 0.01, hold: 10 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.maLen + 1) return 0;
  const s = ctx.sma("close", p.maLen, i);
  const sp = ctx.sma("close", p.maLen, i - 1);
  return bars[i].close > (1 + p.band) * s && bars[i - 1].close <= (1 + p.band) * sp ? 1 : 0;
}
