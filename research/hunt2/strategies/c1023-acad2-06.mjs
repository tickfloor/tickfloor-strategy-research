// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-06). Source: Jondeau, Zhang & Zhu 2019, 'Average skewness matters', Journal of Financial Economics 134(1), 29-47
export const meta = {
  id: "c1023-acad2-06",
  name: "Average skewness timing: hold the equity universe only when average cross-sectional skewness is below its historical median (Jondeau-Zhang-Zhu)",
  family: "volatility",
  source: "c1023/acad2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  warmup: 535,
  params: {"window":21,"minHistory":24},
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

export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (ctx.state.hist === undefined) ctx.state.hist = [];
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 30) continue;
    const r = [];
    for (let k = b.length - p.window; k < b.length; k++) r.push(b[k].close / b[k - 1].close - 1);
    const mu = mean(r);
    let m2 = 0, m3 = 0;
    for (const x of r) { m2 += (x - mu) ** 2; m3 += (x - mu) ** 3; }
    m2 /= r.length; m3 /= r.length;
    names.push({ sym, skew: m2 > 0 ? m3 / Math.pow(m2, 1.5) : 0 });
  }
  if (names.length === 0) return {};
  const as = mean(names.map((x) => x.skew));
  const hist = ctx.state.hist;
  const w = {};
  if (hist.length >= p.minHistory && names.length >= 3) {
    const s = hist.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    const med = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    if (as <= med) for (const x of names) w[x.sym] = 1 / names.length;
  }
  hist.push(as);
  return w;
}
