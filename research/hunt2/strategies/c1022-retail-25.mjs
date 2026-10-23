// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-25). Frozen before code.
// Keltner lower band = EMA20 - 2 * ATR10. Pullback buy only above EMA200. Long only.
export const meta = {
  id: "c1022-retail-25",
  name: "Keltner channel pullback buy in an uptrend (Raschke-style)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  params: { ema: 20, atr: 10, mult: 2, trendEma: 200, maxHold: 10 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; }
  const mid = ctx.ema("close", p.ema, i);
  const atr = ctx.atr(p.atr, i);
  const trend = ctx.ema("close", p.trendEma, i);
  if (!(Number.isFinite(mid) && Number.isFinite(atr) && Number.isFinite(trend))) return 0;

  if (S.pos === 1) {
    if (b.close >= mid || b.close < trend || i - S.entry >= p.maxHold) S.pos = 0;
    return S.pos;
  }
  const lower = mid - p.mult * atr;
  if (b.close < lower && b.close > trend) { S.pos = 1; S.entry = i; }
  return S.pos;
}
