// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-31). Frozen before code.
// Strong HA candle = green with no lower wick beyond wickTol. Enter after confirmBars consecutive strong candles. Long only.
export const meta = {
  id: "c1022-retail-31",
  name: "Heikin Ashi strong candles (no lower wick) continuation (Valcu)",
  family: "trend",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { wickTol: 0.0005, confirmBars: 2 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) { S.pos = 0; S.hoPrev = NaN; S.hcPrev = NaN; S.run = 0; }
  const ho = i === 0 ? (b.open + b.close) / 2 : (S.hoPrev + S.hcPrev) / 2;
  const hc = (b.open + b.high + b.low + b.close) / 4;
  const hl = Math.min(b.low, ho, hc);
  S.hoPrev = ho; S.hcPrev = hc;

  const strong = hc > ho && hl >= ho * (1 - p.wickTol);
  S.run = strong ? S.run + 1 : 0;
  if (S.pos === 1) {
    if (hc < ho) S.pos = 0;
  } else if (S.run >= p.confirmBars) {
    S.pos = 1;
  }
  return S.pos;
}
