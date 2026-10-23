// Spec: research/hunt2/campaign-1024/prereg-r3.json (c1024-r3-13). Portfolio rank, monthly, long-only.
export const meta = {
  id: "c1024-r3-13__rob2",
  name: "Lower-tail dependence with the market sorted inside the high-volatility half (wide US stocks), monthly (+25%)",
  family: "volatility",
  source: "c1024/r3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 630, tailPct: 0.05, topFrac: 0.2, volBars: 252, highVolFrac: 0.5 },
};

const DAY = 86400;
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
function sampleStd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((p, q) => p + (q - m) ** 2, 0) / (xs.length - 1));
}
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);
function pctl(xs, p) {
  const s = xs.slice().sort((a, b) => a - b);
  const pos = p * (s.length - 1), lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
// Eligible names (more than minLen bars) with their last n daily returns on the union calendar (c1023-acad2-03 panel).
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
  const { window, tailPct, topFrac, volBars, highVolFrac } = ctx.params;
  const P = panel(universe, 631, window);
  if (P.cal.length < window) return {};
  const qm = pctl(P.market, tailPct);
  const tail = [];
  P.market.forEach((m, d) => { if (m <= qm) tail.push(d); });
  if (tail.length === 0) return {};
  const names = P.names;
  const ltd = names.map(({ sym, r }) => {
    const qi = pctl(r, tailPct);
    let hit = 0;
    for (const d of tail) if (r[d] <= qi) hit++;
    return [sym, hit / tail.length];
  });
  const vol = names.map(({ sym }) => {
    const b = universe[sym], e = b.length - 1;
    const r = [];
    for (let j = 0; j < volBars; j++) r.push(retAt(b, e - j));
    return [sym, sampleStd(r)];
  });
  const HV = new Set(topN(vol, Math.floor(highVolFrac * names.length)));
  const k = Math.floor(topFrac * names.length);
  if (k < 3) return {};
  const picks = topN(ltd.filter(([s]) => HV.has(s)), k);
  const out = {};
  for (const s of picks) out[s] = 1 / k;
  return out;
}
