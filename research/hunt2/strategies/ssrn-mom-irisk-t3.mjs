// SSRN run 3: 12-1 momentum (identical to wide-mom12_1_stocks) after dropping the top tercile of names by idiosyncratic risk.
// IRISK = sd of residuals from regressing the name's daily return on the equal-weight daily return of every name in the universe on that date,
// over the 336 daily returns ending at the rebalance bar. Names with fewer than 337 closes are not ranked (same eligibility in every variant of run 3).
export const meta = {
  id: "ssrn-mom-irisk-t3",
  name: "12-1 momentum excluding the top tercile by idiosyncratic risk (wide US stocks)",
  family: "momentum",
  source: "Ben-David et al. via SSRN top-20 #12; prereg research/prereg-2026-10-07-ssrn.md run 3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { lookback: 252, skip: 21, top: 4, win: 336 },
};

export function rank(universe, t, ctx) {
  const { lookback, skip, top, win } = ctx.params;
  const syms = [];
  const mk = {};
  const cnt = {};
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < win + 1) continue;
    syms.push(sym);
    for (let k = b.length - win; k < b.length; k++) {
      const key = b[k].time;
      mk[key] = (mk[key] ?? 0) + (b[k].close / b[k - 1].close - 1);
      cnt[key] = (cnt[key] ?? 0) + 1;
    }
  }
  if (syms.length < top * 3) return {};
  const scored = [];
  for (const sym of syms) {
    const b = universe[sym];
    const x = [];
    const y = [];
    for (let k = b.length - win; k < b.length; k++) {
      x.push(mk[b[k].time] / cnt[b[k].time]);
      y.push(b[k].close / b[k - 1].close - 1);
    }
    let mx = 0;
    let my = 0;
    for (let k = 0; k < win; k++) { mx += x[k]; my += y[k]; }
    mx /= win;
    my /= win;
    let sxx = 0;
    let sxy = 0;
    for (let k = 0; k < win; k++) { sxx += (x[k] - mx) ** 2; sxy += (x[k] - mx) * (y[k] - my); }
    const beta = sxx > 0 ? sxy / sxx : 0;
    let ss = 0;
    for (let k = 0; k < win; k++) ss += (y[k] - my - beta * (x[k] - mx)) ** 2;
    const irisk = Math.sqrt(ss / (win - 2));
    scored.push([sym, irisk, b[b.length - 1 - skip].close / b[b.length - 1 - lookback].close - 1]);
  }
  scored.sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1));
  const keep = scored.slice(Math.floor(scored.length / 3));
  keep.sort((p, q) => q[2] - p[2] || (p[0] < q[0] ? -1 : 1));
  const w = {};
  for (const [sym] of keep.slice(0, top)) w[sym] = 1 / top;
  return w;
}
