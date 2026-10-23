// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-14). Source: Keloharju, Linnainmaa & Nyberg 2016, 'Return seasonalities', Journal of Finance 71(4), 1557-1590; Heston & Sadka 2008, JFE 87(2)
export const meta = {
  id: "c1023-acad2-14",
  name: "Cross-asset same-calendar-month seasonality: top 5 of 25 ETFs by their average return in the coming calendar month over prior years (Keloharju-Linnainmaa-Nyberg)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","XLK","XLF","XLE","XLV","XLI","XLP","XLY","XLU","XLB","XLC","VNQ","TLT","IEF","SHY","LQD","HYG","AGG","GLD","SLV","USO","UNG","DBC","UUP"],
  rebalance: "monthly",
  warmup: 3711,
  params: {"minObs":3,"topN":5},
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
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const mo = ctx.resample(universe[sym], "1M").filter((x) => x.complete && monthOf(Math.floor(x.time / DAY)) === M);
    if (mo.length < p.minObs) continue;
    scored.push({ sym, v: mean(mo.map((x) => x.close / x.open - 1)) });
  }
  const k = Math.min(p.topN, scored.length);
  if (k < 3) return {};
  scored.sort((a, b) => b.v - a.v || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of scored.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
