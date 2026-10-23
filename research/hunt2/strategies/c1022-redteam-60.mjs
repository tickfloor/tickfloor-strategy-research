// c1022 red-team spec 60 (campaign-1022/prereg-redteam.json, frozen before code).
// Daniel & Moskowitz 2016 JFE; Barroso & Santa-Clara 2015 JFE.
// 12-1 momentum top 15% with a 10% basket drawdown circuit breaker (cash for the next month).
export const meta = {
  id: "c1022-redteam-60",
  name: "12-1 momentum top 15% with a 10% basket drawdown circuit breaker (cash for the next month)",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { lookback: 252, skip: 21, frac: 0.15, ddTrigger: 0.1, ddWindow: 21, need: 254, minNames: 50 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { lookback, skip, frac, ddTrigger, ddWindow, need, minNames } = ctx.params;

  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    const e = b.length - 1;
    const score = b[e - skip].close / b[e - lookback].close - 1;
    if (Number.isFinite(score)) scored.push([sym, score]);
  }
  const n = scored.length;
  if (n < minNames) return ew(universe);

  scored.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const T = scored.slice(0, Math.round(frac * n)).map((x) => x[0]);

  let cash = false;
  if (ctx.state.prev !== undefined) {
    // drawdown of the previously held basket over its last ddWindow daily returns (names aligned on their last bar)
    let P = 1;
    let peak = 1;
    for (let j = 1; j <= ddWindow; j++) {
      let sum = 0;
      let cnt = 0;
      for (const sym of ctx.state.prev) {
        const b = universe[sym];
        if (!b) continue;
        const kk = b.length - 1 - (ddWindow - j);
        if (kk < 1) continue; // no bar on this day: left out of the mean
        sum += b[kk].close / b[kk - 1].close - 1;
        cnt++;
      }
      const r = cnt > 0 ? sum / cnt : 0;
      P *= 1 + r;
      if (P > peak) peak = P;
    }
    const dd = 1 - P / peak;
    if (dd >= ddTrigger) cash = true;
  }

  ctx.state.prev = T;
  if (cash) return {};
  const w = {};
  for (const sym of T) w[sym] = 1 / T.length;
  return w;
}
