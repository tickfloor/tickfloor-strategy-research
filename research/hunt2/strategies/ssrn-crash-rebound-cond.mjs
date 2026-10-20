// SSRN run 5 (cond). Portfolio, daily rebalance: at each close, buy the coins that qualify, hold to the next close (1-day hold), equal weight, fully invested; flat when none qualify.
// Qualify (cond): close-to-close return <= dropMax AND return minus the equal-weight return of the other coins that day <= relMax AND 30-day median dollar volume in the top half of coins that day.
// Control: the drop threshold only. All inputs are known at the rebalance close.
export const meta = {
  id: "ssrn-crash-rebound-cond",
  name: "Conditioned crypto crash rebound: drop <= -15%, relative loss <= -10%, liquid half",
  family: "mean_reversion",
  source: "Fehle & Zdorovtsov via SSRN top-20 #13; prereg research/prereg-2026-10-07-ssrn.md run 5",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { dropMax: -0.15, relMax: -0.1, dvWin: 30 },
};

export function rank(universe, t, ctx) {
  const { dropMax, relMax, dvWin } = ctx.params;
  const rows = [];
  let sum = 0;
  let m = 0;
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < dvWin + 1) continue;
    const r = b[n - 1].close / b[n - 2].close - 1;
    const d = [];
    for (let k = n - dvWin; k < n; k++) d.push(b[k].close * b[k].volume);
    d.sort((x, y) => x - y);
    rows.push([sym, r, (d[(dvWin >> 1) - 1] + d[dvWin >> 1]) / 2]);
    sum += r;
    m++;
  }
  if (m < 4) return {};
  const byDv = rows.map((x) => x[2]).sort((x, y) => y - x);
  const cut = byDv[Math.ceil(m / 2) - 1];
  const cand = [];
  for (const [sym, r, dv] of rows) {
    if (dv < cut) continue;
    if (r > dropMax || r - (sum - r) / (m - 1) > relMax) continue;
    cand.push(sym);
  }
  const w = {};
  for (const sym of cand) w[sym] = 1 / cand.length;
  return w;
}
