// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-flag-s",
  "name": "Bull flag: 15%+ pole in 10 days, 3-10 bar flag retracing at most 38%, buy the flag-high break, 10-day hold (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "TikTok/YouTube 'bull flag' pattern content; day-trading education staple",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "pole": 0.15,
    "poleBars": 10,
    "maxRetrace": 0.38,
    "hold": 10
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  if (s.pos === undefined) s.pos = 0;
  if (s.pos === 1) { s.held++; if (b.close < s.stop || s.held >= P.hold) s.pos = 0; return s.pos; }
  if (i < P.poleBars + 12) return 0;
  for (let f = 3; f <= 10; f++) {
    let F = -Infinity, G = Infinity;
    for (let k = i - f; k < i; k++) { if (bars[k].high > F) F = bars[k].high; if (bars[k].low < G) G = bars[k].low; }
    if (!(b.close > F)) continue;
    let PL = Infinity;
    for (let k = i - f - P.poleBars; k < i - f; k++) if (bars[k].low < PL) PL = bars[k].low;
    if (F / PL - 1 >= P.pole && (F - G) / (F - PL) <= P.maxRetrace) { s.pos = 1; s.stop = G; s.held = 0; break; }
  }
  return s.pos;
}
