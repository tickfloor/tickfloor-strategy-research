export const meta = {
  "id": "st-trail-comm-fixed",
  "name": "Steelman 55d breakout, fixed exit (comm)",
  "family": "steelman-1004",
  "source": "steelman-1004 PREREG (Reddit commenters, day-1004/haiku)",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "GLD",
    "SLV",
    "USO",
    "UNG",
    "DBC"
  ],
  "params": {
    "entryN": 55,
    "exit": "fixed",
    "stop": 0.1,
    "target": 0.2
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, S = ctx.state, c = bars[i].close;
  if (i < 60) return 0;
  if (S.pos === undefined) { S.pos = 0; S.entry = 0; S.peak = 0; }
  if (S.pos === 1) {
    if (c > S.peak) S.peak = c;
    let out = false;
    if (P.exit === "fixed") out = c <= S.entry * (1 - P.stop) || c >= S.entry * (1 + P.target);
    else if (P.exit === "pct") out = c <= S.peak * (1 - P.trail);
    else out = c <= S.peak - P.atrMult * ctx.atr(P.atrN);
    if (out) { S.pos = 0; return 0; }
    return 1;
  }
  if (c > ctx.donchian(P.entryN, i - 1).upper) { S.pos = 1; S.entry = c; S.peak = c; return 1; }
  return 0;
}
