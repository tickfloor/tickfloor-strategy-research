// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-17). Source: Kamstra, Kramer & Levi 2000, 'Losing sleep at the market: the daylight saving anomaly', American Economic Review 90(4), 1005-1011
export const meta = {
  id: "c1023-acad2-17",
  name: "Daylight-saving Monday: flat QQQ/DIA on the first session after each clock change, long otherwise (Kamstra-Kramer-Levi)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA"],
  proxyFor: {"SPY":"QQQ"},
  params: {},
};

const DAY = 86400;
function dow(d) { return (d + 4) % 7; } // 0 = Sunday
function dn(y, m, d) { return Date.UTC(y, m, d) / (DAY * 1000); } // m is 0-based, result is epoch day number (Date.UTC is ms)
function yearOf(d) { return new Date(d * DAY * 1000).getUTCFullYear(); }
function monthOf(d) { return new Date(d * DAY * 1000).getUTCMonth() + 1; }
function nextWeekday(d) { let x = d + 1; const w = dow(x); if (w === 6) x += 2; else if (w === 0) x += 1; return x; }
function nthWd(y, m, wd, n) { const f = dn(y, m, 1); return f + ((wd - dow(f) + 7) % 7) + 7 * (n - 1); }
function lastWd(y, m, wd) { const l = dn(y, m + 1, 0); return l - ((dow(l) - wd + 7) % 7); }

function clockSunday(x) {
  const y = yearOf(x);
  if (y >= 2007) return x === nthWd(y, 2, 0, 2) || x === nthWd(y, 10, 0, 1);
  if (y >= 1987) return x === nthWd(y, 3, 0, 1) || x === lastWd(y, 9, 0);
  return false;
}
export function signal(bars, i, ctx) {
  const P = nextWeekday(Math.floor(bars[i].time / DAY));
  return dow(P) === 1 && clockSunday(P - 1) ? 0 : 1;
}
