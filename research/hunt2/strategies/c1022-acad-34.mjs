// c1022 acad chunk 3. Keloharju, Linnainmaa & Nyberg 2021, JFE 139(1), 138-167 (seasonal reversal).
export const meta = {
  id: "c1022-acad-34",
  name: "Seasonal reversal: long names with the lowest average return in the OTHER calendar months (Keloharju-Linnainmaa-Nyberg)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { years: 3, bottomFrac: 0.2 },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function nextSession(t) {
  let s = (Math.floor(t / DAY) + 1) * DAY;
  while (dowOf(s) === 0 || dowOf(s) === 6) s += DAY;
  return s;
}
function monthKey(t) { const d = new Date(t * 1000); return d.getUTCFullYear() * 12 + d.getUTCMonth(); }

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
  const { years, bottomFrac } = ctx.params;
  const need = years * 12;
  const curKey = monthKey(t);
  const m = new Date(nextSession(t) * 1000).getUTCMonth(); // calendar month of the coming session
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 760) continue;
    // complete months strictly before the month of t (the month of t is never used)
    const monthly = ctx.resample(b, "1M").filter((x) => x.complete && monthKey(x.time) < curKey);
    if (monthly.length < need) continue;
    let sum = 0, n = 0;
    for (let k = monthly.length - need; k < monthly.length; k++) {
      if (k < 1) continue;
      const prev = monthly[k - 1], cur = monthly[k];
      if (monthKey(cur.time) !== monthKey(prev.time) + 1) continue; // consecutive months only
      if (new Date(cur.time * 1000).getUTCMonth() === m) continue;  // "other" months only
      sum += cur.close / prev.close - 1;
      n++;
    }
    if (n === 0) continue;
    scores.push([sym, sum / n]);
  }
  return pickEqual(scores, bottomFrac, true);
}
