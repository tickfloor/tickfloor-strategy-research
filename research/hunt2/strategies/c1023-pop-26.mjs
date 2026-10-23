// c1023 pop chunk 2. RSI(14) momentum: cross above 70, exit below 50 (Cardwell; Brown 1999).
export const meta = {
  id: "c1023-pop-26",
  name: "RSI(14) above 70 as a momentum buy on US stocks: enter on the cross above 70, exit below 50",
  family: "momentum",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { rsi: 14, entry: 70, exit: 50 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; }
  const r = ctx.rsi(p.rsi, i);
  if (S.pos === 1) {
    if (r < p.exit) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < 1) return 0;
  const rPrev = ctx.rsi(p.rsi, i - 1);
  if (r >= p.entry && rPrev < p.entry) { S.pos = 1; return 1; }
  return 0;
}
