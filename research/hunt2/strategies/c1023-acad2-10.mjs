// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-10). Source: Barberis, Mukherjee & Wang 2016, 'Prospect theory and stock returns: an empirical test', Review of Financial Studies 29(11), 3068-3107
export const meta = {
  id: "c1023-acad2-10",
  name: "Prospect-theory value: long the quintile with the lowest TK value of the past 60 monthly returns (Barberis-Mukherjee-Wang)",
  family: "other",
  source: "c1023/acad2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  warmup: 1289,
  params: {"months":60,"alpha":0.88,"lambda":2.25,"gammaPlus":0.61,"gammaMinus":0.69,"topFrac":0.2},
};

const DAY = 86400;
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
function pctl(xs, p) {
  const s = xs.slice().sort((a, b) => a - b);
  const pos = p * (s.length - 1), lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
// ponytail: k = floor(frac * N); fewer than 3 chosen names = cash
function pickTop(scored, frac, dir) {
  scored.sort((a, b) => dir * (b.v - a.v) || (a.sym < b.sym ? -1 : 1));
  const k = Math.floor(frac * scored.length);
  if (k < 3) return {};
  const w = {};
  for (const x of scored.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
// Eligible names (more than minLen bars) with their last n daily returns on the union calendar.
// Names with a missing day in that window are not in the cross-section. market = EW mean of all eligible names.
function panel(universe, minLen, n) {
  const maps = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= minLen) continue;
    const bars = b.slice(-(n + 1));
    const m = new Map();
    for (let k = 1; k < bars.length; k++) m.set(Math.floor(bars[k].time / DAY), bars[k].close / bars[k - 1].close - 1);
    maps.push([sym, m]);
  }
  const cal = [...new Set(maps.flatMap(([, m]) => [...m.keys()]))].sort((x, y) => x - y).slice(-n);
  const market = cal.map((d) => {
    let s = 0, c = 0;
    for (const [, m] of maps) { const v = m.get(d); if (v !== undefined) { s += v; c++; } }
    return c ? s / c : NaN;
  });
  const names = maps.filter(([, m]) => cal.every((d) => m.has(d))).map(([sym, m]) => ({ sym, r: cal.map((d) => m.get(d)) }));
  return { cal, market, names };
}

function v(x, a, lam) { return x >= 0 ? Math.pow(x, a) : -lam * Math.pow(-x, a); }
function wt(q, g) { const a = Math.pow(q, g), b = Math.pow(1 - q, g); return a / Math.pow(a + b, 1 / g); }
function tk(rets, p) {
  const L = p.months;
  const neg = rets.filter((x) => x < 0).sort((a, b) => a - b); // neg[m-j] = r(-j), r(-1) the least negative
  const pos = rets.filter((x) => x >= 0).sort((a, b) => a - b); // pos[j-1] = r(j)
  const m = neg.length, n = pos.length;
  let s = 0;
  for (let j = 1; j <= m; j++) s += v(neg[m - j], p.alpha, p.lambda) * (wt(j / L, p.gammaMinus) - wt((j - 1) / L, p.gammaMinus));
  for (let j = 1; j <= n; j++) s += v(pos[j - 1], p.alpha, p.lambda) * (wt((n - j + 1) / L, p.gammaPlus) - wt((n - j) / L, p.gammaPlus));
  return s;
}
// Monthly return of a complete month = close / open - 1 (resampled 1M bars); last p.months months used.
export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 30) continue;
    const mo = ctx.resample(b, "1M").filter((x) => x.complete);
    if (mo.length < p.months) continue;
    const rets = mo.slice(-p.months).map((x) => x.close / x.open - 1);
    scored.push({ sym, v: tk(rets, p) });
  }
  return pickTop(scored, p.topFrac, -1);
}
