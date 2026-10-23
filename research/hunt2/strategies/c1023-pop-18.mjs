// c1023 pop chunk 2. Bulkowski double bottom (Adam & Adam), neckline break.
export const meta = {
  id: "c1023-pop-18",
  name: "Bulkowski double bottom (Adam & Adam): two fractal lows within 3% at least 15 bars apart, 10% middle rise, buy the neckline break, measured-move target",
  family: "trend",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { fractal: 5, minGap: 15, maxGap: 60, lowTol: 0.03, minRise: 0.1, confirmWindow: 40, maxBars: 60 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; S.stop = 0; S.target = 0; S.piv = []; S.pat = null; }
  const c = bars[i].close;

  // pivot low at k is confirmed at bar k + fractal (= i)
  const k = i - p.fractal;
  if (k - p.fractal >= 0) {
    let isPiv = true;
    for (let j = k - p.fractal; j < k && isPiv; j++) if (!(bars[k].low < bars[j].low)) isPiv = false;
    for (let j = k + 1; j <= i && isPiv; j++) if (!(bars[k].low < bars[j].low)) isPiv = false;
    if (isPiv) {
      S.piv.push(k);
      S.pat = null;
      if (S.piv.length >= 2) {
        const a = S.piv[S.piv.length - 2], b = k;
        const gap = b - a;
        const lowA = bars[a].low, lowB = bars[b].low;
        if (gap >= p.minGap && gap <= p.maxGap && Math.abs(lowB / lowA - 1) <= p.lowTol) {
          let P = -Infinity;
          for (let j = a; j <= b; j++) if (bars[j].high > P) P = bars[j].high;
          const base = Math.min(lowA, lowB);
          if (P >= (1 + p.minRise) * base) {
            let broken = false;
            for (let j = b + 1; j <= i; j++) if (bars[j].close > P) { broken = true; break; }
            S.pat = { b, P, stop: lowB, target: P + (P - base), broken };
          }
        }
      }
    }
  }

  const pat = S.pat;
  if (S.pos === 1) {
    // Review fix: closes above P while long still count, so the pattern cannot fire again after the exit.
    if (pat && c > pat.P) pat.broken = true;
    if (c >= S.target || c < S.stop || i - S.entry >= p.maxBars) { S.pos = 0; return 0; }
    return 1;
  }
  // entry window: b+5 < i <= b+45, first close above the neckline P
  let entered = false;
  if (pat && !pat.broken && i > pat.b + p.fractal && i <= pat.b + p.fractal + p.confirmWindow && c > pat.P) {
    S.pos = 1; S.entry = i; S.stop = pat.stop; S.target = pat.target;
    entered = true;
  }
  if (pat && c > pat.P) pat.broken = true;
  return entered ? 1 : 0;
}
