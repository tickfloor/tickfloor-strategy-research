// c1023 pop chunk 2. Mayer Multiple overheat filter (Trace Mayer 2017).
export const meta = {
  id: "c1023-pop-29",
  name: "Mayer Multiple overheat exit: long while close is below 2.4x the 200-day SMA, flat above it (crypto)",
  family: "trend",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1d",
  params: { sma: 200, sellMultiple: 2.4 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.sma("close", p.sma, i);
  if (!(s > 0)) return 0;
  const mm = bars[i].close / s;
  return mm < p.sellMultiple ? 1 : 0;
}
