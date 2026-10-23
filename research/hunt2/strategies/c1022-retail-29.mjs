// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-29). Frozen before code.
// Anchor = bar with the highest high in the last 252 bars (latest bar wins ties), so a new 252-bar high re-anchors.
// AVWAP runs from the anchor bar. Entry reclaim needs AVWAP[i-1] defined; on a bar that is itself the anchor
// there is no AVWAP[i-1], so no entry. Long only.
export const meta = {
  id: "c1022-retail-29",
  name: "Anchored VWAP from the 52-week high: reclaim buy",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { anchorLookback: 252, stopBuffer: 0.02 },
};

function anchorAt(bars, j, N) {
  const start = j - N + 1;
  let a = start;
  for (let k = start; k <= j; k++) if (bars[k].high >= bars[a].high) a = k;
  return a;
}

function avwapFrom(bars, a, j) {
  let pv = 0, v = 0;
  for (let k = a; k <= j; k++) {
    const x = bars[k];
    pv += ((x.high + x.low + x.close) / 3) * x.volume;
    v += x.volume;
  }
  return v > 0 ? pv / v : NaN;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) S.pos = 0;
  const N = p.anchorLookback;
  if (i < N) return 0;

  const a = anchorAt(bars, i, N);
  const avNow = avwapFrom(bars, a, i);
  const avPrev = a === i ? NaN : avwapFrom(bars, a, i - 1);

  if (S.pos === 1) {
    let hm = -Infinity;
    for (let k = i - N + 1; k < i; k++) if (bars[k].high > hm) hm = bars[k].high;
    if (b.close < avNow * (1 - p.stopBuffer) || b.high > hm) S.pos = 0;
    return S.pos;
  }
  if (Number.isFinite(avPrev) && Number.isFinite(avNow) && bars[i - 1].close < avPrev && b.close > avNow) S.pos = 1;
  return S.pos;
}
