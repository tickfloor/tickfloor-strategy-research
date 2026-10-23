// c1022 acad chunk 3. Keloharju, Linnainmaa & Nyberg 2016, JF 71(4), 1557-1590 (return seasonalities).
export const meta = {
  id: "c1022-acad-35",
  name: "Same-weekday return seasonality: long the names with the best average return on the coming weekday over the past year (Keloharju et al.)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "daily",
  params: { occurrences: 52, topFrac: 0.2 },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function nextSession(t) {
  let s = (Math.floor(t / DAY) + 1) * DAY;
  while (dowOf(s) === 0 || dowOf(s) === 6) s += DAY;
  return s;
}

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
  const { occurrences, topFrac } = ctx.params;
  const d = dowOf(nextSession(t)); // weekday of the coming session
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 300) continue;
    // last `occurrences` bars whose own weekday is d; bar k return = close[k]/close[k-1]-1
    let sum = 0, n = 0;
    for (let k = b.length - 1; k >= 1 && n < occurrences; k--) {
      if (dowOf(b[k].time) !== d) continue;
      sum += b[k].close / b[k - 1].close - 1;
      n++;
    }
    if (n > 0) scores.push([sym, sum / n]);
  }
  return pickEqual(scores, topFrac, false);
}
