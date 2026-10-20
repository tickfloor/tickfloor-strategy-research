export const meta = {
  "id": "st-mtf-h4",
  "name": "Steelman multi-timeframe 4h only",
  "family": "steelman-1004",
  "source": "steelman-1004 PREREG (Reddit commenters, day-1004/haiku)",
  "assetClass": "crypto",
  "timeframe": "1h",
  "params": {
    "sma": 50,
    "mode": "h4"
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, S = ctx.state, b = bars[i];
  if (S.w4 === undefined) { S.w4 = ctx.rolling(50); S.wd = ctx.rolling(50); S.pos = 0; S.h4 = 0; S.d = 0; }
  const hr = Math.floor(b.time / 3600) % 24;
  if (hr === 23) { S.wd.push(b.close); S.dayClose = b.close; }
  if (hr % 4 !== 3) return S.pos;
  S.w4.push(b.close);
  if (!S.w4.full() || !S.wd.full()) return 0;
  // daily signal: latest COMPLETED daily close vs SMA of daily closes (refreshed at 23h bar close)
  S.d = S.dayClose > S.wd.mean() ? 1 : 0;
  S.h4 = b.close > S.w4.mean() ? 1 : 0;
  S.pos = P.mode === "d" ? S.d : P.mode === "h4" ? S.h4 : S.d && S.h4 ? 1 : 0;
  return S.pos;
}
