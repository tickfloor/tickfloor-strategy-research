// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-04). Frozen before code.
export const meta = {
  id: "c1022-retail-04",
  name: "RSI crosses its own 14-period SMA (TradingView default RSI-based MA)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: {"rsi": 14, "maLen": 14},
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (i < 1) return 0;
  // SMA14 of RSI(14) at bar k (NaN until valid).
  const m = (k) => {
    if (k - 13 < 0) return NaN;
    let t = 0;
    for (let j = k - 13; j <= k; j++) {
      const x = ctx.rsi(14, j);
      if (Number.isNaN(x)) return NaN;
      t += x;
    }
    return t / 14;
  };
  const r = ctx.rsi(14, i), rp = ctx.rsi(14, i - 1);
  const m1 = m(i), m0 = m(i - 1);
  if (s.pos === 1) {
    if (r < m1) s.pos = 0;
  } else if (rp <= m0 && r > m1 && r > 50) {
    s.pos = 1;
  }
  return s.pos;
}
