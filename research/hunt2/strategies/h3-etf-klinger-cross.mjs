// Spec: docs/research/hunt-1003/codex/specs.json (h3-etf-klinger-cross). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-etf-klinger-cross",
  name: "Does the Klinger volume oscillator work on ETFs?",
  family: "indicator-klinger",
  source: "https://www.tradingview.com/support/solutions/43000589157-klinger-oscillator/",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ","DIA","XLK","XLF","XLE","XLV","XLI","XLP","XLY","XLU","XLB","XLC","VNQ","TLT","IEF","SHY","LQD","HYG","AGG","GLD","SLV","USO","UNG","DBC","UUP"],
  longShort: false,
  params: { fastLength: 34, slowLength: 55, signalLength: 13, warmupBars: 100 },
};

// custom EMA seeded with mean of its first n finite inputs
function mk(n) { return { n, buf: [], v: NaN }; }
function upd(e, x) {
  if (!isFinite(x)) return e.v;
  if (e.buf.length < e.n) { e.buf.push(x); if (e.buf.length === e.n) e.v = e.buf.reduce((a, b) => a + b, 0) / e.n; }
  else e.v = e.v + (2 / (e.n + 1)) * (x - e.v);
  return e.v;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state, b = bars[i];
  if (s.fast === undefined) { s.fast = mk(p.fastLength); s.slow = mk(p.slowLength); s.sig = mk(p.signalLength); }
  const dm = b.high - b.low;
  let T, cm;
  if (i === 0) { T = -1; cm = dm; }
  else {
    const q = bars[i - 1];
    T = b.high + b.low + b.close > q.high + q.low + q.close ? 1 : -1;
    cm = T === s.T ? s.cm + dm : s.dm + dm;
  }
  s.T = T; s.dm = dm; s.cm = cm;
  const vf = cm === 0 ? 0 : b.volume * 2 * (dm / cm - 1) * T * 100;
  const f = upd(s.fast, vf), sl = upd(s.slow, vf);
  const ko = isFinite(f) && isFinite(sl) ? f - sl : NaN;
  const sg = upd(s.sig, ko);
  if (i + 1 < p.warmupBars || !isFinite(ko) || !isFinite(sg)) return 0;
  return ko > sg ? 1 : 0;
}
