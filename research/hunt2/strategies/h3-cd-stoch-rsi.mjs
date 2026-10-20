// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-stoch-rsi). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-cd-stoch-rsi",
  name: "Does the Stochastic RSI work on crypto?",
  family: "indicator-stoch-rsi",
  source: "retail trading content: stochastic rsi crypto strategy 20 80",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { rsiPeriod: 14, stochPeriod: 14, kSmooth: 3, dSmooth: 3, oversold: 20, overbought: 80, warmupBars: 40 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state;
  if (s.init === undefined) {
    s.init = true; s.rsis = []; s.kw = ctx.rolling(P.kSmooth); s.dw = ctx.rolling(P.dSmooth);
    s.pk = NaN; s.pd = NaN; s.pos = 0; s.held = 0;
  }
  const r = ctx.rsi(P.rsiPeriod);
  let K = NaN, D = NaN;
  if (r === r) {
    s.rsis.push(r);
    if (s.rsis.length > P.stochPeriod) s.rsis.shift();
    if (s.rsis.length === P.stochPeriod) {
      const mn = Math.min(...s.rsis), mx = Math.max(...s.rsis);
      const raw = mx === mn ? 50 : 100 * (r - mn) / (mx - mn);
      s.kw.push(raw);
      if (s.kw.full()) {
        K = s.kw.mean(); s.dw.push(K);
        if (s.dw.full()) D = s.dw.mean();
      }
    }
  }
  const ok = K === K && D === D && s.pk === s.pk && s.pd === s.pd;
  const crossUp = ok && s.pk <= s.pd && K > D, crossDn = ok && s.pk >= s.pd && K < D;
  s.pk = K; s.pd = D;
  if (i < P.warmupBars) return 0;
  if (s.pos === 1) {
    s.held++;
    if (crossDn && ((K > P.overbought && D > P.overbought) || s.held > 20)) s.pos = 0;
  } else if (crossUp && K < P.oversold && D < P.oversold) { s.pos = 1; s.held = 0; }
  return s.pos;
}
