// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-56). Portfolio rank mode, monthly.
// Ardila-Alvarez, Forro & Sornette 2021: long the top 20% by acceleration (change in 12-month momentum).

export const meta = {
  id: "c1022-acad-56",
  name: "Acceleration: long stocks whose last-6-month return most exceeds the prior 6 months (Ardila-Alvarez-Forro-Sornette)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { half: 126, topFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const { half, topFrac } = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 253) continue;
    const n = b.length;
    const last = b[n - 1].close, mid = b[n - 1 - half].close, far = b[n - 1 - 2 * half].close;
    scores.push({ sym, acc: (last / mid - 1) - (mid / far - 1) });
  }
  const k = Math.floor(topFrac * scores.length);
  if (k < 3) return {};
  scores.sort((a, c) => c.acc - a.acc);
  const w = {};
  for (const x of scores.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
