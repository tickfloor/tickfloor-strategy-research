// c1022 acad chunk 3. Etula, Rinne, Suominen & Vaittinen 2020, RFS 33(1), 75-111 (dash for cash).
// tomBefore=1 is encoded by the explicit last-session test (case c); tomAfter sets the first-session test (case b).
export const meta = {
  id: "c1022-acad-37",
  name: "Turn-of-month beta rotation: high beta over month-end days, low beta otherwise (Etula et al. 'Dash for cash')",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "daily",
  params: { betaBars: 252, frac: 0.2, tomBefore: 1, tomAfter: 3 },
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

// beta_i = cov(ret_i, EW market) / var(EW market) over the last n bars.
// EW market = equal-weight mean of the daily returns of every eligible name on each day (time-aligned).
function betas(universe, eligible, n) {
  const sums = new Map(); // time -> [sum of returns, count]
  const rets = {};
  for (const sym of eligible) {
    const b = universe[sym];
    const m = new Map();
    for (let k = b.length - n; k < b.length; k++) {
      const r = b[k].close / b[k - 1].close - 1;
      m.set(b[k].time, r);
      const a = sums.get(b[k].time) || [0, 0];
      a[0] += r; a[1] += 1;
      sums.set(b[k].time, a);
    }
    rets[sym] = m;
  }
  const out = [];
  for (const sym of eligible) {
    const m = rets[sym];
    if (m.size < n) continue;
    const xs = [], ys = [];
    for (const [tm, r] of m) {
      const a = sums.get(tm);
      xs.push(r);
      ys.push(a[0] / a[1]);
    }
    const mx = xs.reduce((a, x) => a + x, 0) / n;
    const my = ys.reduce((a, x) => a + x, 0) / n;
    let cov = 0, vy = 0;
    for (let j = 0; j < n; j++) {
      cov += (xs[j] - mx) * (ys[j] - my);
      vy += (ys[j] - my) ** 2;
    }
    if (vy > 0 && Number.isFinite(cov / vy)) out.push([sym, cov / vy]);
  }
  return out;
}

export function rank(universe, t, ctx) {
  const { betaBars, frac, tomAfter } = ctx.params;
  const eligible = Object.keys(universe).filter((s) => universe[s].length > 260);
  if (eligible.length === 0) return {};
  const ns = nextSession(t);

  // k = sessions of t's month seen so far (incl. t), counted on the longest eligible series
  let ref = eligible[0];
  for (const s of eligible) if (universe[s].length > universe[ref].length) ref = s;
  const rb = universe[ref];
  let k = 0;
  for (let j = rb.length - 1; j >= 0 && monthKey(rb[j].time) === monthKey(t); j--) k++;

  const a = monthKey(ns) !== monthKey(t);                                          // (a) bar t+1 is session 1
  const b = k >= 1 && k + 1 <= tomAfter;                                           // (b) bar t+1 is session 2 or 3
  const c = monthKey(ns) === monthKey(t) && monthKey(nextSession(ns)) !== monthKey(t); // (c) bar t+1 is the last session
  const highBeta = a || b || c;

  return pickEqual(betas(universe, eligible, betaBars), frac, !highBeta);
}
