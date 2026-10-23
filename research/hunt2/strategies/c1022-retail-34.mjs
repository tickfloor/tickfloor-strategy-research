// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-34). Frozen before code.
// Narrow CPR: prior-day width < narrowRatio * mean width of the last widthAvg complete days (prior day included).
// Breakout above prior-day high before entryHoursMax UTC. Long only.
export const meta = {
  id: "c1022-retail-34",
  name: "Narrow CPR breakout (Ochoa central pivot range)",
  family: "volatility",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1h",
  params: { narrowRatio: 0.5, widthAvg: 10, entryHoursMax: 12 },
};

function cprWidth(d) {
  const P = (d.h + d.l + d.c) / 3;
  const BC = (d.h + d.l) / 2;
  const TC = 2 * P - BC;
  return Math.abs(TC - BC) / P;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) {
    S.pos = 0; S.day = null; S.cH = -Infinity; S.cL = Infinity; S.cC = NaN; S.days = [];
  }
  const day = Math.floor(b.time / 86400);
  if (day !== S.day) {
    if (S.day !== null) S.days.push({ h: S.cH, l: S.cL, c: S.cC });
    S.day = day; S.cH = -Infinity; S.cL = Infinity;
  }
  S.cH = Math.max(S.cH, b.high); S.cL = Math.min(S.cL, b.low); S.cC = b.close;
  const n = p.widthAvg;
  if (S.days.length < n) return 0;

  const prior = S.days[S.days.length - 1];
  let sum = 0;
  for (let k = S.days.length - n; k < S.days.length; k++) sum += cprWidth(S.days[k]);
  const narrow = cprWidth(prior) < p.narrowRatio * (sum / n);
  const P = (prior.h + prior.l + prior.c) / 3;
  const hour = Math.floor((b.time % 86400) / 3600);

  if (S.pos === 1) {
    if (b.close < P || hour === 23) S.pos = 0;
  } else if (narrow && hour <= p.entryHoursMax && b.close > prior.h) {
    S.pos = 1;
  }
  return S.pos;
}
