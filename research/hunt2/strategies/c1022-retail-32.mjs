// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-32). Frozen before code.
// Pivot levels from the prior complete UTC day (day = floor(time/86400)). Long only.
export const meta = {
  id: "c1022-retail-32",
  name: "Camarilla L3 bounce with L4 stop (Ochoa)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1h",
  params: { camarillaRange: 1.1, exitHour: 23 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) {
    S.pos = 0; S.day = null; S.cH = -Infinity; S.cL = Infinity; S.cC = NaN;
    S.pH = NaN; S.pL = NaN; S.pC = NaN;
  }
  const day = Math.floor(b.time / 86400);
  if (day !== S.day) {
    if (S.day !== null) { S.pH = S.cH; S.pL = S.cL; S.pC = S.cC; }
    S.day = day; S.cH = -Infinity; S.cL = Infinity;
  }
  S.cH = Math.max(S.cH, b.high); S.cL = Math.min(S.cL, b.low); S.cC = b.close;
  if (!Number.isFinite(S.pH)) return 0;

  const hour = Math.floor((b.time % 86400) / 3600);
  const R = (S.pH - S.pL) * p.camarillaRange;
  const L3 = S.pC - R / 4, L4 = S.pC - R / 2, P = (S.pH + S.pL + S.pC) / 3;

  if (S.pos === 1) {
    if (b.close < L4 || b.close >= P || hour === p.exitHour) S.pos = 0;
  } else if (hour < p.exitHour && b.low <= L3 && b.close > L3) {
    S.pos = 1;
  }
  return S.pos;
}
