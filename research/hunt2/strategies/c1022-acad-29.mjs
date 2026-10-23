export const meta = {
  id: "c1022-acad-29",
  name: "Momentum's January reversal: hold 12-1 winners Feb-Dec, 12-1 losers in January (Jegadeesh-Titman)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 252, skip: 21, topFrac: 0.2 },
};

// Month (0 = January) of the next weekday after the UTC date of t (Fri -> Mon).
function nextSessionMonth(t) {
  let day = Math.floor(t / 86400) + 1;
  const wd = (day + 4) % 7; // 0 = Sunday
  if (wd === 6) day += 2;
  else if (wd === 0) day += 1;
  return new Date(day * 86400 * 1000).getUTCMonth();
}

// Coming month January: long the bottom topFrac by 12-1 momentum. Otherwise: long the top topFrac. Equal weight; cash if fewer than 3 names.
export function rank(universe, t, ctx) {
  const { form, skip, topFrac } = ctx.params;
  const rows = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= form + 1) continue;
    const L = b.length - 1;
    rows.push([s, b[L - skip].close / b[L - form].close - 1]);
  }
  const bottom = nextSessionMonth(t) === 0;
  rows.sort((x, y) => (bottom ? x[1] - y[1] : y[1] - x[1]) || (x[0] < y[0] ? -1 : 1));
  const k = Math.floor(topFrac * rows.length);
  if (k < 3) return {};
  const w = {};
  for (const [s] of rows.slice(0, k)) w[s] = 1 / k;
  return w;
}
