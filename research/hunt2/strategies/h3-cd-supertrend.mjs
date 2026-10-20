// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-supertrend). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-cd-supertrend",
  name: "Does the Supertrend indicator work on crypto?",
  family: "indicator-supertrend",
  source: "retail trading content: supertrend 10 3 crypto strategy",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { atrPeriod: 10, multiplier: 3, warmupBars: 30 },
};

function stStep(bars, i, ctx, P) {
  const s = ctx.state;
  if (s.up === undefined) { s.up = false; s.fu = NaN; s.fl = NaN; s.init = false; }
  const atr = ctx.atr(P.atrPeriod);
  if (!(atr === atr)) return null;
  const b = bars[i], hl2 = (b.high + b.low) / 2;
  const bu = hl2 + P.multiplier * atr, bl = hl2 - P.multiplier * atr;
  if (!s.init) { s.fu = bu; s.fl = bl; s.init = true; s.up = false; }
  else {
    const pc = bars[i - 1].close;
    const fu = (bu < s.fu || pc > s.fu) ? bu : s.fu;
    const fl = (bl > s.fl || pc < s.fl) ? bl : s.fl;
    s.fu = fu; s.fl = fl;
    if (b.close > s.fu) s.up = true; else if (b.close < s.fl) s.up = false;
  }
  return s.up;
}

export function signal(bars, i, ctx) {
  const up = stStep(bars, i, ctx, ctx.params);
  if (i < ctx.params.warmupBars || up === null) return 0;
  return up ? 1 : 0;
}
