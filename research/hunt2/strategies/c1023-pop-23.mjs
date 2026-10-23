// c1023 pop chunk 2. Buy the dip in a bull market (crypto), r/CryptoCurrency canon.
export const meta = {
  id: "c1023-pop-23",
  name: "Buy the dip in a bull market: 10% off the 20-day high while above the 200-day SMA, exit on a new 20-day high or trend break (crypto)",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1d",
  params: { dipPct: 0.1, high: 20, sma: 200, maxBars: 30 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; }
  const c = bars[i].close;
  const s200 = ctx.sma("close", p.sma, i);
  if (S.pos === 1) {
    let h = -Infinity;
    for (let k = i - p.high; k < i; k++) if (bars[k].close > h) h = bars[k].close;
    if (c > h || c < s200 || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < p.high) return 0;
  let h20 = -Infinity;
  for (let k = i - p.high; k < i; k++) if (bars[k].close > h20) h20 = bars[k].close;
  if (c > s200 && c <= (1 - p.dipPct) * h20) {
    S.pos = 1; S.entry = i;
    return 1;
  }
  return 0;
}
