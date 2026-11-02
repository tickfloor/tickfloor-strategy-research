// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-01). Campbell, Grossman & Wang 1993, QJE 108(4), 905-939
export const meta = {
  id: "c1031-acad4-01",
  name: "Volume-conditioned index autocorrelation: reverse high-volume moves, extend low-volume moves, 13 equity ETFs (Campbell-Grossman-Wang)",
  family: "mean_reversion",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: true,
  params: { volWin: 20, minMove: 0.005 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.volWin + 1) return 0;
  const r = bars[i].close / bars[i - 1].close - 1;
  const vbar = ctx.rollingMean("volume", p.volWin, i - 1);
  if (!(vbar > 0) || Math.abs(r) < p.minMove) return 0;
  const q = bars[i].volume / vbar;
  const s = Math.sign(r);
  return q > 1 ? -s : s;
}
