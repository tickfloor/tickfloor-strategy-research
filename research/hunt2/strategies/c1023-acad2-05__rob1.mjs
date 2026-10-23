// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-05). Source: Cosemans & Frehen 2021, 'Salience theory and stock prices: empirical evidence', Journal of Financial Economics 140(2), 460-483
export const meta = {
  id: "c1023-acad2-05__rob1",
  name: "Salience theory: long the quintile with the lowest salience-weighted past-month return (Cosemans-Frehen) (-25%)",
  family: "other",
  source: "c1023/acad2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: {"window":16,"theta":0.1,"delta":0.7,"topFrac":0.2},
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
  const n = p.window;
  const P = panel(universe, 30, n);
  if (P.cal.length < n) return {};
  let denom = 0;
  for (let j = 1; j <= n; j++) denom += Math.pow(p.delta, j);
  const rb = P.market;
  const scored = P.names.map(({ sym, r }) => {
    const sal = r.map((x, d) => Math.abs(x - rb[d]) / (Math.abs(x) + Math.abs(rb[d]) + p.theta));
    const order = sal.map((_, d) => d).sort((a, b) => sal[b] - sal[a] || a - b);
    const omega = new Array(n);
    order.forEach((d, k) => { omega[d] = Math.pow(p.delta, k + 1) / denom; });
    let st = 0;
    for (let d = 0; d < n; d++) st += (omega[d] - 1 / n) * r[d];
    return { sym, v: st };
  });
  return pickTop(scored, p.topFrac, -1);
}
