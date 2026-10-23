// c1022 acad chunk 3. Lou, Polk & Skouras 2019, JFE 134(1), 192-213 (intraday-return reversal).
export const meta = {
  id: "c1022-acad-33",
  name: "Intraday-return reversal: long the lowest cumulative open-to-close return over the past month (Lou-Polk-Skouras)",
  family: "mean_reversion",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { bars: 21, bottomFrac: 0.2 },
};

// Equal-weight the names at one end of the sort; hold cash if fewer than 3 are picked.
function pickEqual(scores, frac, lowest) {
  const n = Math.floor(scores.length * frac);
  if (n < 3) return {};
  scores.sort((a, b) => (lowest ? a[1] - b[1] : b[1] - a[1]) || (a[0] < b[0] ? -1 : 1));
  const w = {};
  for (const [sym] of scores.slice(0, n)) w[sym] = 1 / n;
  return w;
}

export function rank(universe, t, ctx) {
  const { bars, bottomFrac } = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 30) continue;
    let intra = 0;
    for (let k = b.length - bars; k < b.length; k++) intra += Math.log(b[k].close / b[k].open);
    if (Number.isFinite(intra)) scores.push([sym, intra]);
  }
  return pickEqual(scores, bottomFrac, true);
}
