// Spec: docs/research/hunt-1003/codex/specs.json (h3-hourly-ema-9-21-cross). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-hourly-ema-9-21-cross",
  name: "Does the 9/21 EMA cross work on 1-hour crypto?",
  family: "crypto-1h-crosses",
  source: "retail trading content: 9 21 ema crossover crypto 1h scalping",
  assetClass: "crypto",
  timeframe: "1h",
  longShort: false,
  params: { fast: 9, slow: 21, trendFilter: 200, warmupBars: 210 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params;
  if (i < P.warmupBars) return 0;
  const f = ctx.ema("close", P.fast), s = ctx.ema("close", P.slow), t = ctx.ema("close", P.trendFilter);
  if (!(f === f) || !(s === s) || !(t === t)) return 0;
  return f > s && bars[i].close > t ? 1 : 0;
}
