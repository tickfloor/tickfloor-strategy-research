// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-22). Frozen before code.
// Supertrend with standard final-band carry-forward: up flip when close > previous final upper band,
// down flip when close < previous final lower band. Long only.
export const meta = {
  id: "c1022-retail-22",
  name: "Supertrend(10,3) flip filtered by the 200 EMA",
  family: "trend",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { atr: 10, mult: 3, ema: 200 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) { S.pos = 0; S.trend = 0; S.fu = NaN; S.fl = NaN; S.pc = NaN; }
  const atr = ctx.atr(p.atr, i);
  if (!Number.isFinite(atr)) return 0;

  const hl2 = (b.high + b.low) / 2;
  const bu = hl2 + p.mult * atr, bl = hl2 - p.mult * atr;
  let flipUp = false, flipDown = false;
  if (S.trend === 0) {
    S.fu = bu; S.fl = bl; S.trend = b.close >= hl2 ? 1 : -1;
  } else {
    const fu = bu < S.fu || S.pc > S.fu ? bu : S.fu;
    const fl = bl > S.fl || S.pc < S.fl ? bl : S.fl;
    let t = S.trend;
    if (b.close > S.fu) t = 1;
    else if (b.close < S.fl) t = -1;
    flipUp = t === 1 && S.trend === -1;
    flipDown = t === -1 && S.trend === 1;
    S.fu = fu; S.fl = fl; S.trend = t;
  }
  S.pc = b.close;

  const e = ctx.ema("close", p.ema, i);
  if (flipDown) S.pos = 0;
  else if (flipUp && Number.isFinite(e) && b.close > e) S.pos = 1;
  return S.pos;
}
