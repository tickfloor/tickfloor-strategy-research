// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-12). Source: Hamill, Rattray & van Hemert 2016, 'Trend following: equity and bond crisis alpha', Journal of Portfolio Management 42(5), 11-31
export const meta = {
  id: "c1023-acad2-12",
  name: "Trend-following crisis alpha, slow: 12-month long-short vol-scaled TSMOM on 23 non-index ETFs only while QQQ is 10% off its 1-year high (Hamill-Rattray-van Hemert, slow-signal variant)",
  family: "trend",
  source: "c1023/acad2",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","XLK","XLF","XLE","XLV","XLI","XLP","XLY","XLU","XLB","XLC","VNQ","TLT","IEF","SHY","LQD","HYG","AGG","GLD","SLV","USO","UNG","DBC","UUP"],
  rebalance: "weekly",
  longShort: true,
  warmup: 2950,
  params: {"drawdown":0.1,"ddWindow":252,"look":252,"volBars":63,"targetVol":0.1,"maxWeight":0.15},
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

const NONIDX = ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"];
export function rank(universe, t, ctx) {
  const p = ctx.params;
  const q = universe.QQQ;
  if (!universe.DIA || !q || q.length <= p.ddWindow) return {};
  let hi = -Infinity;
  for (let k = q.length - p.ddWindow; k < q.length; k++) hi = Math.max(hi, q[k].close);
  const dd = q[q.length - 1].close / hi - 1;
  if (dd > -p.drawdown) return { QQQ: 0.5, DIA: 0.5 };
  const w = {};
  let gross = 0;
  for (const sym of NONIDX) {
    const b = universe[sym];
    if (!b || b.length <= p.look + p.volBars) continue;
    const L = b.length;
    const sgn = Math.sign(b[L - 1].close / b[L - 1 - p.look].close - 1);
    if (sgn === 0) continue;
    const r = [];
    for (let k = L - p.volBars; k < L; k++) r.push(b[k].close / b[k - 1].close - 1);
    const mu = mean(r);
    const vol = Math.sqrt(r.reduce((s, x) => s + (x - mu) ** 2, 0) / r.length) * Math.sqrt(252);
    const raw = vol > 0 ? (p.targetVol / NONIDX.length) / vol : Infinity;
    const wi = sgn * Math.min(raw, p.maxWeight);
    w[sym] = wi;
    gross += Math.abs(wi);
  }
  if (gross > 1) for (const k of Object.keys(w)) w[k] /= gross;
  return w;
}
