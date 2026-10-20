// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-supertrend-s",
  "name": "Supertrend(10,3) trend flip (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "TradingView SuperTrend [KivancOzbilgic] 55K likes; YouTube 'BEST Supertrend Strategy' 363K views",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n": 10,
    "m": 3,
    "shorts": false
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const a = ctx.atr(P.n);
  if (!(a === a)) return 0;
  const hl2 = (b.high + b.low) / 2;
  let up = hl2 - P.m * a, dn = hl2 + P.m * a;
  if (s.up === undefined) { s.up = up; s.dn = dn; s.dir = 1; return 1; }
  const pc = bars[i - 1].close, pu = s.up, pd = s.dn;
  if (pc > pu) up = Math.max(up, pu);
  if (pc < pd) dn = Math.min(dn, pd);
  if (s.dir === -1 && b.close > pd) s.dir = 1; else if (s.dir === 1 && b.close < pu) s.dir = -1;
  s.up = up; s.dn = dn;
  return s.dir === 1 ? 1 : (P.shorts ? -1 : 0);
}
