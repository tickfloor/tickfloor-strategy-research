// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-17). Mean return on the 4 highest-volume days of the year, monthly.
export const meta = {
  id: "c1031-stockxs-17",
  name: "Earnings-reaction momentum: the 8 large caps with the best average return on their 4 highest-volume days of the past year, monthly",
  family: "event-driven",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { window: 252, nDays: 4, top: 8 },
};

const ok = (x) => Number.isFinite(x) && x > 0;

export function rank(universe, t, ctx) {
  const { window: W, nDays, top } = ctx.params;
  const cands = [];
  for (const sym of Object.keys(universe).sort()) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < W + 1) continue;
    let good = true;
    for (let k = e - W; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    if (!good) continue;
    const days = [];
    for (let k = e - W + 1; k <= e; k++) days.push(k);
    // highest volume first; ties: later bar first
    days.sort((x, y) => b[y].volume - b[x].volume || y - x);
    let s = 0;
    for (const k of days.slice(0, nDays)) s += b[k].close / b[k - 1].close - 1;
    cands.push({ sym, score: s / nDays });
  }
  if (cands.length < top) return {};
  cands.sort((x, y) => y.score - x.score || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const c of cands.slice(0, top)) w[c.sym] = 1 / top;
  return w;
}
