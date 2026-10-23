// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-54). Portfolio rank mode, monthly.
// Corwin & Schultz 2012 high-low spread estimator; long the top 20% most illiquid names.

export const meta = {
  id: "c1022-acad-54__rob2",
  name: "High-low bid-ask spread estimator: long the most illiquid quintile by Corwin-Schultz spread (+25%)",
  family: "other",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { bars: 26, topFrac: 0.2 },
};

const K = 3 - 2 * Math.SQRT2;

// mean Corwin-Schultz spread over the last `bars` bars (bars-1 consecutive pairs)
function spread(b, bars) {
  const n = b.length;
  let sum = 0;
  for (let k = n - bars + 1; k < n; k++) {
    const p = b[k - 1], c = b[k];
    const beta = Math.log(p.high / p.low) ** 2 + Math.log(c.high / c.low) ** 2;
    const gamma = Math.log(Math.max(p.high, c.high) / Math.min(p.low, c.low)) ** 2;
    const alpha = (Math.sqrt(2 * beta) - Math.sqrt(beta)) / K - Math.sqrt(gamma / K);
    const ea = Math.exp(alpha);
    sum += Math.max(0, (2 * (ea - 1)) / (1 + ea));
  }
  return sum / (bars - 1);
}

export function rank(universe, t, ctx) {
  const { bars, topFrac } = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 30) continue;
    const s = spread(b, bars);
    if (Number.isFinite(s)) scores.push({ sym, s });
  }
  const k = Math.floor(topFrac * scores.length);
  if (k < 3) return {};
  scores.sort((a, c) => c.s - a.s);
  const w = {};
  for (const x of scores.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
