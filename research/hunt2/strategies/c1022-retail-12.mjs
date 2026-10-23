// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-12). Frozen before code.
export const meta = {
  id: "c1022-retail-12",
  name: "Best Six Months with MACD timing (Hirsch)",
  family: "seasonality",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC"],
  proxyFor: {"SPY": "QQQ"},
  params: {"fast": 12, "slow": 26, "signal": 9},
};

// MACD(12,26,9): line via ctx.ema; signal = custom EMA9 (alpha 2/10, seeded with first valid line).
// Must be called once per bar, in order, before reading lines/sigs.
function macdAt(ctx, i) {
  const s = ctx.state;
  if (s.lines === undefined) { s.lines = []; s.sigs = []; }
  const line = ctx.ema("close", 12, i) - ctx.ema("close", 26, i);
  let sig = NaN;
  if (!Number.isNaN(line)) {
    const ps = i > 0 ? s.sigs[i - 1] : NaN;
    sig = Number.isNaN(ps) ? line : ps + (2 / 10) * (line - ps);
  }
  s.lines.push(line);
  s.sigs.push(sig);
}

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  macdAt(ctx, i);
  const l = ctx.state.lines[i], g = ctx.state.sigs[i];
  // Buy window: 1 Oct .. 30 Apr. Sell window: 1 May .. 30 Sep. Dates in UTC.
  const m = new Date(bars[i].time * 1000).getUTCMonth() + 1;
  const buyWin = m >= 10 || m <= 4;
  const sellWin = m >= 5 && m <= 9;
  if (buyWin) {
    if (s.pos === 0 && l > g) s.pos = 1;
  } else if (sellWin) {
    if (s.pos === 1 && l < g) s.pos = 0;
  }
  return s.pos;
}
