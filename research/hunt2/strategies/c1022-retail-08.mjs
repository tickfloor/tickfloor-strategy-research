// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-08). Frozen before code.
export const meta = {
  id: "c1022-retail-08",
  name: "MACD zero-line cross (Murphy)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: {"fast": 12, "slow": 26, "signal": 9},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const line = (k) => ctx.ema("close", 12, k) - ctx.ema("close", 26, k);
  const l = line(i), lp = i > 0 ? line(i - 1) : NaN;
  if (s.pos === 1) {
    if (l < 0) s.pos = 0;
  } else if (lp <= 0 && l > 0) {
    s.pos = 1;
  }
  return s.pos;
}
