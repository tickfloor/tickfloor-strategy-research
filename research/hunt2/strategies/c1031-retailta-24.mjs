// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-24). Mulloy 1994, TEMA crossover.
export const meta = {
  id: "c1031-retailta-24",
  name: "TEMA(10)/TEMA(30) cross: triple exponential moving averages",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { fast: 10, slow: 30 },
};

// One EMA step; seeded with the SMA of the first n inputs, NaN until seeded.
const newEma = () => ({ c: 0, s: 0, e: NaN });
function stepEma(s, x, n) {
  if (s.c < n) { s.s += x; s.c++; if (s.c === n) s.e = s.s / n; }
  else s.e += (2 / (n + 1)) * (x - s.e);
  return s.e;
}

// TEMA = 3*E1 - 3*E2 + E3, each EMA of the previous one.
function tema(st, key, n, x) {
  if (!st[key]) st[key] = [newEma(), newEma(), newEma()];
  const [a, b, c] = st[key];
  const e1 = stepEma(a, x, n);
  const e2 = Number.isFinite(e1) ? stepEma(b, e1, n) : NaN;
  const e3 = Number.isFinite(e2) ? stepEma(c, e2, n) : NaN;
  return 3 * e1 - 3 * e2 + e3;
}

export function signal(bars, i, ctx) {
  const pr = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.pf = NaN; st.ps = NaN; }
  const c = bars[i].close;
  const f = tema(st, "f", pr.fast, c);
  const s = tema(st, "s", pr.slow, c);
  const enter = st.pf <= st.ps && f > s;
  const exit = f < s;
  if (st.pos === 0) { if (enter) st.pos = 1; }
  else if (exit) st.pos = 0;
  st.pf = f;
  st.ps = s;
  return st.pos;
}
