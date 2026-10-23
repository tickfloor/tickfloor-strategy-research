// c1023 pop chunk 2. Hourly golden cross on crypto: long while EMA50 above EMA200.
export const meta = {
  id: "c1023-pop-31__rob1",
  name: "Hourly golden cross on crypto: long while the 50 EMA is above the 200 EMA (-25%)",
  family: "trend",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1h",
  params: { fast: 38, slow: 150 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; }
  const f = ctx.ema("close", p.fast, i), s = ctx.ema("close", p.slow, i);
  if (S.pos === 1) {
    if (f < s) { S.pos = 0; return 0; }
    return 1;
  }
  if (f > s) { S.pos = 1; return 1; }
  return 0;
}
