// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-03). Source: Chabi-Yo, Ruenzi & Weigert 2018, 'Crash sensitivity and the cross-section of expected stock returns', Journal of Financial and Quantitative Analysis 53(3), 1059-1100
export const meta = {
  id: "c1023-acad2-03__rob1",
  name: "Crash sensitivity: long the quintile with the highest lower-tail dependence with the market (Chabi-Yo-Ruenzi-Weigert) (-25%)",
  family: "volatility",
  source: "c1023/acad2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  warmup: 400,
  params: {"window":378,"tailPct":0.05,"topFrac":0.2},
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
  const P = panel(universe, 379, p.window);
  if (P.cal.length < p.window) return {};
  const qm = pctl(P.market, p.tailPct);
  const tail = [];
  P.market.forEach((m, d) => { if (m <= qm) tail.push(d); });
  if (tail.length === 0) return {};
  const scored = P.names.map(({ sym, r }) => {
    const qi = pctl(r, p.tailPct);
    let hit = 0;
    for (const d of tail) if (r[d] <= qi) hit++;
    return { sym, v: hit / tail.length };
  });
  return pickTop(scored, p.topFrac, 1);
}
