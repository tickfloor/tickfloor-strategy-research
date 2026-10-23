// c1023 pop chunk 2. Hourly MACD cross below zero above the 200 EMA, 1.5R target, swing-low stop (crypto).
export const meta = {
  id: "c1023-pop-30",
  name: "YouTube MACD + 200 EMA: hourly MACD cross up below the zero line above the 200 EMA, 1.5R target, swing-low stop (crypto)",
  family: "momentum",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1h",
  params: { ema: 200, macd: [12, 26, 9], swingLow: 10, rr: 1.5, maxBars: 48 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; S.stop = 0; S.target = 0; S.line = undefined; S.sig = undefined; }
  const c = bars[i].close;
  // MACD line and its signal EMA(9), seeded with the first valid line value
  const prevLine = S.line, prevSig = S.sig;
  const line = ctx.ema("close", p.macd[0], i) - ctx.ema("close", p.macd[1], i);
  if (Number.isFinite(line)) S.sig = prevSig === undefined ? line : (2 / (p.macd[2] + 1)) * line + (1 - 2 / (p.macd[2] + 1)) * prevSig;
  S.line = line;
  const sig = S.sig;
  if (S.pos === 1) {
    if (c <= S.stop || c >= S.target || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  if (i < p.swingLow) return 0;
  const e = ctx.ema("close", p.ema, i);
  const crossUp = Number.isFinite(prevLine) && Number.isFinite(prevSig) && prevLine <= prevSig && line > sig;
  if (!(c > e) || !crossUp || !(line < 0)) return 0;
  let stop = Infinity;
  for (let k = i - p.swingLow; k <= i; k++) if (bars[k].low < stop) stop = bars[k].low;
  const R = c - stop;
  if (!(R > 0)) return 0;
  S.pos = 1; S.entry = i; S.stop = stop; S.target = c + p.rr * R;
  return 1;
}
