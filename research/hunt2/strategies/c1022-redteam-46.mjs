// c1022 red-team spec 46: 12-1 momentum top 15% only when market breadth (% above 200-day) >= 50%.
// Source: Daniel & Moskowitz 2016 JFE (momentum crashes); Cooper, Gutierrez & Hameed 2004 JF.
export const meta = {
  id: "c1022-redteam-46",
  name: "12-1 momentum top 15% only when market breadth (% above 200-day) is at least 50%",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { lookback: 252, skip: 21, frac: 0.15, sma: 200, breadthMin: 0.5, need: 254, minNames: 50 },
};

const cmpName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { lookback, skip, frac, sma, breadthMin, need, minNames } = ctx.params;
  const q = Object.keys(universe).filter((s) => universe[s].length >= need);
  const n = q.length;
  if (n < minNames) return ew(universe);

  let above = 0;
  for (const s of q) {
    const b = universe[s];
    const e = b.length - 1;
    let sum = 0;
    for (let j = e - sma + 1; j <= e; j++) sum += b[j].close;
    if (b[e].close > sum / sma) above++;
  }
  if (above / n < breadthMin) return {};

  const scored = q.map((s) => {
    const b = universe[s];
    const e = b.length - 1;
    return [s, b[e - skip].close / b[e - lookback].close - 1];
  });
  scored.sort((a, b) => b[1] - a[1] || cmpName(a[0], b[0]));
  const K = Math.round(frac * n);
  const w = {};
  for (const [s] of scored.slice(0, K)) w[s] = 1 / K;
  return w;
}
