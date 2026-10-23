export const meta = {
  id: "c1022-macro-06",
  name: "Hourly crypto 24h momentum only while VIX3M is trending down",
  family: "momentum",
  source: "c1022/macro",
  assetClass: "crypto",
  timeframe: "1h",
  params: { mom: 24, sma: 480 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.roll === undefined) ctx.state.roll = ctx.rolling(p.sma);
  const v = ctx.macro("VIX3M", i);
  if (v !== null) ctx.state.roll.push(v);
  if (v === null || !ctx.state.roll.full()) return 0;
  if (!(v < ctx.state.roll.mean())) return 0;
  if (i - p.mom < 0) return 0;
  return bars[i].close > bars[i - p.mom].close ? 1 : 0;
}
