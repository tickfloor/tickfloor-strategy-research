// c1023 pop chunk 2. Three red days above the 200-day on crypto, sell on first up close.
export const meta = {
  id: "c1023-pop-25",
  name: "Three red days above the 200-day on crypto: buy after three consecutive down closes, sell on the first up close",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1d",
  params: { downDays: 3, sma: 200, maxBars: 5 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; }
  const c = bars[i].close;
  if (S.pos === 1) {
    if (c > bars[i - 1].close || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < p.downDays) return 0;
  const down3 = c < bars[i - 1].close && bars[i - 1].close < bars[i - 2].close && bars[i - 2].close < bars[i - 3].close;
  if (down3 && c > ctx.sma("close", p.sma, i)) {
    S.pos = 1; S.entry = i;
    return 1;
  }
  return 0;
}
