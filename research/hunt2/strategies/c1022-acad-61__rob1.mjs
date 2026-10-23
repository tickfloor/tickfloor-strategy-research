// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-61). Portfolio rank mode, monthly.
// Bandarchuk & Hilscher 2013: 12-1 momentum winners within the high-volatility half of the universe.

export const meta = {
  id: "c1022-acad-61__rob1",
  name: "Momentum among high-volatility stocks: 12-1 winners within the top half by volatility (Bandarchuk-Hilscher) (-25%)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { volBars: 252, highVolFrac: 0.5, form: 189, skip: 21, topFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const { volBars, highVolFrac, form, skip, topFrac } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length > 260);
  const N = elig.length;
  if (N < 3) return {};

  const vols = elig.map((sym) => {
    const b = universe[sym], n = b.length;
    const r = [];
    for (let m = 0; m < volBars; m++) r.push(b[n - 1 - m].close / b[n - 2 - m].close - 1);
    const mean = r.reduce((a, v) => a + v, 0) / volBars;
    return { sym, vol: Math.sqrt(r.reduce((a, v) => a + (v - mean) ** 2, 0) / (volBars - 1)) };
  });
  vols.sort((a, c) => c.vol - a.vol);
  const H = vols.slice(0, Math.floor(highVolFrac * N)).map((x) => x.sym);

  const k = Math.floor(topFrac * N);
  if (k < 3) return {};
  const mom = H.map((sym) => {
    const b = universe[sym], n = b.length;
    return { sym, mom: b[n - 1 - skip].close / b[n - 1 - form].close - 1 };
  });
  mom.sort((a, c) => c.mom - a.mom);
  const picks = mom.slice(0, Math.min(k, mom.length));
  const w = {};
  for (const x of picks) w[x.sym] = 1 / picks.length;
  return w;
}
