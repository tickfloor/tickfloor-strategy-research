// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-23). Frozen before code.
// Supertrend(10,3) on Heikin Ashi candles; ATR is Wilder on HA high/low/close (seeded with the mean of the first n TRs).
// Standard flip rule: up when HA close > previous final upper band, down when < previous final lower band. Long only.
export const meta = {
  id: "c1022-retail-23",
  name: "Supertrend computed on Heikin Ashi candles",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  params: { atr: 10, mult: 3 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, S = ctx.state, b = bars[i];
  if (S.pos === undefined) {
    S.pos = 0; S.trend = 0; S.fu = NaN; S.fl = NaN; S.pc = NaN;
    S.hoPrev = NaN; S.hcPrev = NaN; S.n = 0; S.sumTR = 0; S.atr = NaN;
  }
  const n = p.atr;
  const ho = i === 0 ? (b.open + b.close) / 2 : (S.hoPrev + S.hcPrev) / 2;
  const hc = (b.open + b.high + b.low + b.close) / 4;
  const hh = Math.max(b.high, ho, hc), hl = Math.min(b.low, ho, hc);
  const tr = i === 0 ? hh - hl : Math.max(hh - hl, Math.abs(hh - S.hcPrev), Math.abs(hl - S.hcPrev));
  S.hoPrev = ho; S.hcPrev = hc;

  S.n++;
  if (S.n <= n) S.sumTR += tr;
  if (S.n === n) S.atr = S.sumTR / n;
  else if (S.n > n) S.atr = (S.atr * (n - 1) + tr) / n;
  if (S.n < n) return 0;

  const hl2 = (hh + hl) / 2;
  const bu = hl2 + p.mult * S.atr, bl = hl2 - p.mult * S.atr;
  let flipUp = false, flipDown = false;
  if (S.trend === 0) {
    S.fu = bu; S.fl = bl; S.trend = hc >= hl2 ? 1 : -1;
  } else {
    const fu = bu < S.fu || S.pc > S.fu ? bu : S.fu;
    const fl = bl > S.fl || S.pc < S.fl ? bl : S.fl;
    let t = S.trend;
    if (hc > S.fu) t = 1;
    else if (hc < S.fl) t = -1;
    flipUp = t === 1 && S.trend === -1;
    flipDown = t === -1 && S.trend === 1;
    S.fu = fu; S.fl = fl; S.trend = t;
  }
  S.pc = hc;

  const stLine = S.trend === 1 ? S.fl : S.fu;
  if (flipDown) S.pos = 0;
  else if (S.pos === 0 && S.trend === 1 && hc > stLine) S.pos = 1;
  return S.pos;
}
