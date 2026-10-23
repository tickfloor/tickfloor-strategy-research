export const meta = {
  id: "c1022-acad-18",
  name: "Short-horizon time-series momentum: 1-month lookback, 1-month hold, 25 ETFs, long-only (MOP 2012)",
  family: "trend",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: { lookback: 21 },
};

function monthOf(t) {
  const d = new Date(t * 1000);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

// On the first bar of each UTC month, pos = 1 if the trailing lookback return is positive, else 0. Held until the next month start.
export function signal(bars, i, ctx) {
  const { lookback } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (i > 0 && i >= lookback && monthOf(bars[i].time) !== monthOf(bars[i - 1].time)) {
    const r = bars[i].close / bars[i - lookback].close - 1;
    ctx.state.pos = r > 0 ? 1 : 0;
  }
  return ctx.state.pos;
}
