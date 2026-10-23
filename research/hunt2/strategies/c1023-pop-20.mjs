// c1023 pop chunk 2. "Gaps get filled" unfilled-gap-down fade.
export const meta = {
  id: "c1023-pop-20",
  name: "'Gaps get filled': buy an unfilled 1%+ down gap at the close, exit when the pre-gap close is reclaimed or after 10 bars",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { minGapPct: 0.01, maxBars: 10 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; S.fill = 0; }
  const c = bars[i].close;
  if (S.pos === 1) {
    if (c >= S.fill || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < 1) return 0;
  const prev = bars[i - 1];
  const o = bars[i].open;
  if (o < prev.low && o <= (1 - p.minGapPct) * prev.close && c < prev.close) {
    S.pos = 1; S.entry = i; S.fill = prev.close;
    return 1;
  }
  return 0;
}
