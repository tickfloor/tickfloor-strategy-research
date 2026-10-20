// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-keltner-breakout). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-keltner-breakout",
  name: "Does the Keltner channel breakout work on stocks?",
  family: "channel-breakout",
  source: "Chester Keltner / Linda Raschke; retail trading content: keltner channel breakout strategy 20 2",
  assetClass: "us_stock",
  timeframe: "1d",
  longShort: false,
  params: { emaPeriod: 20, atrPeriod: 10, multiplier: 2, warmupBars: 30 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const m = ctx.ema("close", P.emaPeriod), a = ctx.atr(P.atrPeriod);
  if (i < P.warmupBars || !(m === m) || !(a === a)) { s.pos = 0; return 0; }
  const c = bars[i].close;
  if (s.pos === 0 && c > m + P.multiplier * a) s.pos = 1;
  else if (s.pos === 1 && c < m) s.pos = 0;
  return s.pos;
}
