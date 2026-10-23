// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-08). Source: Ariel 1990, 'High stock returns before holidays: existence and evidence on possible causes', Journal of Finance 45(5), 1611-1626; Savor & Wilson 2014, JFE 113(2)
export const meta = {
  id: "c1023-acad2-08",
  name: "Pre-holiday beta rotation: high-beta quintile on the session before each NYSE holiday, low-beta quintile otherwise (Ariel; Savor-Wilson shape)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "daily",
  warmup: 261,
  params: {"betaBars":252,"frac":0.2},
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

function observed(d) { const w = dow(d); return w === 6 ? d - 1 : w === 0 ? d + 1 : d; }
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const x = h + l - 7 * m + 114;
  return dn(y, Math.floor(x / 31) - 1, (x % 31) + 1);
}
// NYSE holidays by the deterministic rules in the spec (fixed-date holidays observed on the nearest weekday)
function holidays(y) {
  const s = new Set([
    observed(dn(y, 0, 1)), nthWd(y, 0, 1, 3), nthWd(y, 1, 1, 3), easter(y) - 2, lastWd(y, 4, 1),
    observed(dn(y, 6, 4)), nthWd(y, 8, 1, 1), nthWd(y, 10, 4, 4), observed(dn(y, 11, 25)),
  ]);
  if (y >= 2022) s.add(observed(dn(y, 5, 19)));
  return s;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const d0 = Math.floor(t / DAY);
  const Q = nextWeekday(nextWeekday(d0));
  const y = yearOf(Q);
  const H = new Set([...holidays(y - 1), ...holidays(y), ...holidays(y + 1)]);
  const preHoliday = H.has(Q);
  const P = panel(universe, 260, p.betaBars);
  if (P.cal.length < p.betaBars) return {};
  const m = P.market;
  const mm = mean(m);
  const den = m.reduce((s, x) => s + (x - mm) ** 2, 0);
  if (!(den > 0)) return {};
  const scored = P.names.map(({ sym, r }) => {
    const mr = mean(r);
    let num = 0;
    for (let d = 0; d < r.length; d++) num += (r[d] - mr) * (m[d] - mm);
    return { sym, v: num / den };
  });
  return pickTop(scored, p.frac, preHoliday ? 1 : -1);
}
