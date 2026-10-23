// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-13). Source: Harvey, Mazzoleni & Melone 2023, 'The unintended consequences of rebalancing', SSRN working paper 4379780; Etula, Rinne, Suominen & Vaittinen 2020, 'Dash for cash', RFS 33(1)
export const meta = {
  id: "c1023-acad2-13",
  name: "Quarter-end rebalancing flows: tilt to the quarter's laggard (bonds vs stocks) over the last 3 sessions of each calendar quarter (Harvey-Mazzoleni-Melone)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","TLT","IEF"],
  rebalance: "daily",
  warmup: 2958,
  params: {"lastSessions":3,"threshold":0.03},
};

const DAY = 86400;
function dow(d) { return (d + 4) % 7; } // 0 = Sunday
function dn(y, m, d) { return Date.UTC(y, m, d) / (DAY * 1000); } // m is 0-based, result is epoch day number (Date.UTC is ms)
function yearOf(d) { return new Date(d * DAY * 1000).getUTCFullYear(); }
function monthOf(d) { return new Date(d * DAY * 1000).getUTCMonth() + 1; }
function nextWeekday(d) { let x = d + 1; const w = dow(x); if (w === 6) x += 2; else if (w === 0) x += 1; return x; }
function nthWd(y, m, wd, n) { const f = dn(y, m, 1); return f + ((wd - dow(f) + 7) % 7) + 7 * (n - 1); }
function lastWd(y, m, wd) { const l = dn(y, m + 1, 0); return l - ((dow(l) - wd + 7) % 7); }

function qIdx(d) { return yearOf(d) * 4 + Math.floor((monthOf(d) - 1) / 3); }
function prevQClose(bars, start) {
  for (let k = bars.length - 1; k >= 0; k--) if (Math.floor(bars[k].time / DAY) < start) return bars[k].close;
  return undefined;
}
export function rank(universe, t, ctx) {
  const p = ctx.params;
  const need = ["QQQ", "DIA", "TLT", "IEF"];
  for (const s of need) if (!universe[s]) return {};
  const d0 = Math.floor(t / DAY);
  const q = qIdx(d0);
  let r = 0;
  for (let d = d0 + 1; qIdx(d) === q; d++) if (dow(d) !== 0 && dow(d) !== 6) r++;
  const start = dn(Math.floor(q / 4), (q % 4) * 3, 1);
  const c0 = {};
  for (const s of need) {
    c0[s] = prevQClose(universe[s], start);
    if (c0[s] === undefined) return {};
  }
  const ret = (s) => universe[s][universe[s].length - 1].close / c0[s];
  const eq = 0.5 * (ret("QQQ") + ret("DIA")) - 1;
  const bd = 0.5 * (ret("TLT") + ret("IEF")) - 1;
  const diff = eq - bd;
  if (r < 1 || r > p.lastSessions || Math.abs(diff) <= p.threshold) return { QQQ: 0.25, DIA: 0.25, TLT: 0.25, IEF: 0.25 };
  return diff > 0 ? { TLT: 0.5, IEF: 0.5 } : { QQQ: 0.5, DIA: 0.5 };
}
