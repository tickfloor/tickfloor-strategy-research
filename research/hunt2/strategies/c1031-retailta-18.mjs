// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-18). Blau (1995), True Strength Index.
export const meta = {
  id: "c1031-retailta-18",
  name: "True Strength Index (25,13) signal cross while TSI is above zero",
  family: "momentum",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: { slow: 25, fast: 13, signal: 7 },
};

// EMA seeded with the SMA of its first n inputs (same convention as ctx.ema)
const mkEma = (n) => ({ n, c: 0, sum: 0, v: NaN });
function step(e, x) {
  e.c++;
  if (e.c < e.n) { e.sum += x; return NaN; }
  if (e.c === e.n) { e.sum += x; e.v = e.sum / e.n; return e.v; }
  e.v += (2 / (e.n + 1)) * (x - e.v);
  return e.v;
}

export function signal(bars, i, ctx) {
  const { slow, fast, signal: sigN } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0;
    st.m1 = mkEma(slow); st.m2 = mkEma(fast);
    st.a1 = mkEma(slow); st.a2 = mkEma(fast);
    st.sg = mkEma(sigN);
    st.tsi = NaN; st.sig = NaN;
  }
  const prevTsi = st.tsi, prevSig = st.sig;
  let tsi = NaN, sig = NaN;
  if (i >= 1) {
    const m = bars[i].close - bars[i - 1].close;
    const e1 = step(st.m1, m);
    const e2 = Number.isFinite(e1) ? step(st.m2, e1) : NaN;
    const a1 = step(st.a1, Math.abs(m));
    const a2 = Number.isFinite(a1) ? step(st.a2, a1) : NaN;
    if (Number.isFinite(e2) && Number.isFinite(a2) && a2 !== 0) {
      tsi = (100 * e2) / a2;
      const s = step(st.sg, tsi);
      if (Number.isFinite(s)) sig = s;
    }
  }
  st.tsi = tsi;
  st.sig = sig;
  if (st.pos === 1) {
    if (tsi < sig) st.pos = 0;
  } else if (prevTsi <= prevSig && tsi > sig && tsi > 0) {
    st.pos = 1;
  }
  return st.pos;
}
