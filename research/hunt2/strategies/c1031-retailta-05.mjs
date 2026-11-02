// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-05). Hutson 1983, TRIX.
export const meta = {
  id: "c1031-retailta-05",
  name: "TRIX(15) signal-line cross: long when TRIX crosses above its 9-period EMA",
  family: "momentum",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { trix: 15, signal: 9 },
};

// EMA over a custom series: seeded with the SMA of the first n inputs, NaN until then.
function feed(s, x) {
  if (Number.isNaN(s.v)) {
    s.buf.push(x);
    if (s.buf.length === s.n) s.v = s.buf.reduce((a, b) => a + b, 0) / s.n;
    return s.v;
  }
  s.v += (2 / (s.n + 1)) * (x - s.v);
  return s.v;
}

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const p = ctx.params;
  if (i === 0) {
    st.e1 = { n: p.trix, buf: [], v: NaN };
    st.e2 = { n: p.trix, buf: [], v: NaN };
    st.e3 = { n: p.trix, buf: [], v: NaN };
    st.sg = { n: p.signal, buf: [], v: NaN };
    st.prevE3 = NaN;
    st.trixPrev = NaN;
    st.sigPrev = NaN;
    st.pos = 0;
  }
  const e1 = feed(st.e1, bars[i].close);
  const e2 = Number.isNaN(e1) ? NaN : feed(st.e2, e1);
  const e3 = Number.isNaN(e2) ? NaN : feed(st.e3, e2);
  const trix = Number.isNaN(e3) || Number.isNaN(st.prevE3) ? NaN : 100 * (e3 / st.prevE3 - 1);
  st.prevE3 = e3;
  const sig = Number.isNaN(trix) ? NaN : feed(st.sg, trix);

  const crossUp = st.trixPrev <= st.sigPrev && trix > sig;
  st.trixPrev = trix;
  st.sigPrev = sig;

  if (st.pos === 1) {
    if (trix < sig) st.pos = 0;
  } else if (crossUp) {
    st.pos = 1;
  }
  return st.pos;
}
