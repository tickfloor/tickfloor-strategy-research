// c1023 pop chunk 2. Buy a 10% correction in equity ETFs, sell at the next 1-year closing high.
export const meta = {
  id: "c1023-pop-22",
  name: "Buy the 10% correction in equity ETFs, sell at the next 1-year high",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  params: { ddPct: 0.1, lookback: 252, maxBars: 250 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; }
  const c = bars[i].close;
  if (S.pos === 1) {
    let mx = -Infinity;
    for (let k = i - p.lookback; k < i; k++) if (bars[k].close > mx) mx = bars[k].close;
    if (c >= mx || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < p.lookback) return 0;
  let pk = -Infinity;
  for (let k = i - p.lookback; k <= i; k++) if (bars[k].close > pk) pk = bars[k].close;
  if (c <= (1 - p.ddPct) * pk) {
    S.pos = 1; S.entry = i;
    return 1;
  }
  return 0;
}
