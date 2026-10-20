// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-supertrend-adx). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-cd-supertrend-adx",
  name: "Does Supertrend plus an ADX filter work on crypto?",
  family: "indicator-supertrend",
  source: "retail trading content: supertrend adx combo strategy",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { atrPeriod: 10, multiplier: 3, adxPeriod: 14, adxMin: 25, warmupBars: 60 },
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

// Wilder ADX, updated once per bar; returns NaN until ready.
function adxStep(bars, i, ctx, n) {
  const s = ctx.state;
  if (s.a === undefined) s.a = { tr: 0, pdm: 0, mdm: 0, adx: NaN, cnt: 0, dxSum: 0, dxN: 0 };
  const a = s.a;
  if (i === 0) return NaN;
  const b = bars[i], p = bars[i - 1];
  const up = b.high - p.high, dn = p.low - b.low;
  const pdm = up > dn && up > 0 ? up : 0, mdm = dn > up && dn > 0 ? dn : 0;
  const tr = Math.max(b.high - b.low, Math.abs(b.high - p.close), Math.abs(b.low - p.close));
  a.cnt++;
  if (a.cnt <= n) {
    a.tr += tr; a.pdm += pdm; a.mdm += mdm;
    if (a.cnt < n) return NaN;
  } else {
    a.tr = a.tr - a.tr / n + tr; a.pdm = a.pdm - a.pdm / n + pdm; a.mdm = a.mdm - a.mdm / n + mdm;
  }
  const pdi = 100 * a.pdm / a.tr, mdi = 100 * a.mdm / a.tr;
  const dx = pdi + mdi === 0 ? 0 : 100 * Math.abs(pdi - mdi) / (pdi + mdi);
  if (a.dxN < n) { a.dxSum += dx; a.dxN++; if (a.dxN === n) a.adx = a.dxSum / n; }
  else a.adx = (a.adx * (n - 1) + dx) / n;
  return a.adx;
}

export function signal(bars, i, ctx) {
  const P = ctx.params;
  const up = stStep(bars, i, ctx, P);
  const adx = adxStep(bars, i, ctx, P.adxPeriod);
  if (i < P.warmupBars || up === null || !(adx === adx)) return 0;
  return up && adx > P.adxMin ? 1 : 0;
}
