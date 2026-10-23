// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-53). Portfolio rank mode, monthly.
// Haugen & Baker 1996: long the 20% of stocks with the most negative monthly-volume trend.

export const meta = {
  id: "c1022-acad-53",
  name: "Volume trend: long stocks whose monthly volume has been declining over two years (Haugen-Baker)",
  family: "other",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { months: 24, bottomFrac: 0.2 },
};

const monthKey = (sec) => { const d = new Date(sec * 1000); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };

export function rank(universe, t, ctx) {
  const { months, bottomFrac } = ctx.params;
  const cur = monthKey(t);
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 540) continue;
    // complete months only: drop the month containing t
    const m = ctx.resample(b, "1M").filter((r) => monthKey(r.time) < cur);
    if (m.length < months) continue;
    const y = m.slice(-months).map((r) => r.volume);
    const yMean = y.reduce((a, v) => a + v, 0) / months;
    if (!(yMean > 0)) continue;
    const xMean = (months + 1) / 2;
    let sxy = 0, sxx = 0;
    for (let j = 0; j < months; j++) {
      const dx = j + 1 - xMean;
      sxy += dx * (y[j] - yMean);
      sxx += dx * dx;
    }
    scores.push({ sym, vt: sxy / sxx / yMean });
  }
  const k = Math.floor(bottomFrac * scores.length);
  if (k < 3) return {};
  scores.sort((a, c) => a.vt - c.vt); // most negative trend first
  const w = {};
  for (const s of scores.slice(0, k)) w[s.sym] = 1 / k;
  return w;
}
