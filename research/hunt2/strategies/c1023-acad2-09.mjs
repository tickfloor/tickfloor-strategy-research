// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-09). Source: Sias 2007, 'Causes and seasonality of momentum profits', Financial Analysts Journal 63(2), 48-54
export const meta = {
  id: "c1023-acad2-09",
  name: "Momentum in quarter-ending months: 12-1 winners held only in March, June, September and December (Sias)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  warmup: 274,
  params: {"form":252,"skip":21,"topFrac":0.2,"months":[3,6,9,12]},
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

function dow(d) { return (d + 4) % 7; } // 0 = Sunday
function dn(y, m, d) { return Date.UTC(y, m, d) / (DAY * 1000); } // m is 0-based, result is epoch day number (Date.UTC is ms)
function yearOf(d) { return new Date(d * DAY * 1000).getUTCFullYear(); }
function monthOf(d) { return new Date(d * DAY * 1000).getUTCMonth() + 1; }
function nextWeekday(d) { let x = d + 1; const w = dow(x); if (w === 6) x += 2; else if (w === 0) x += 1; return x; }
function nthWd(y, m, wd, n) { const f = dn(y, m, 1); return f + ((wd - dow(f) + 7) % 7) + 7 * (n - 1); }
function lastWd(y, m, wd) { const l = dn(y, m + 1, 0); return l - ((dow(l) - wd + 7) % 7); }

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const M = monthOf(nextWeekday(Math.floor(t / DAY)));
  if (p.months.indexOf(M) < 0) return {};
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= p.form + 1) continue;
    scored.push({ sym, v: b[L - 1 - p.skip].close / b[L - 1 - p.form].close - 1 });
  }
  return pickTop(scored, p.topFrac, 1);
}
