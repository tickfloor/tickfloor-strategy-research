// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-16). Lukac-Brorsen-Irwin 1988, Applied Economics 20; Covel 2009
export const meta = {
  id: "c1031-overlay-16",
  name: "Prior-month-low trailing exit on 25 ETFs: out when the close breaks last month's low, back in on a close above last month's high",
  family: "trend-filter",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: false,
  params: { monthsBack: 1 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.on === undefined) ctx.state.on = 0;
  const months = ctx.resample(bars, "1M").filter((r) => r.complete);
  if (months.length < 4) return 0;
  const P = months[months.length - p.monthsBack];
  const c = bars[i].close;
  if (ctx.state.on === 1 && c < P.low) ctx.state.on = 0;
  else if (ctx.state.on === 0 && c > P.high) ctx.state.on = 1;
  return ctx.state.on;
}
