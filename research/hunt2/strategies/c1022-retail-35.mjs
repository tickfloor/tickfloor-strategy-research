// c1022 retail spec 35 (campaign-1022/prereg-retail.json, frozen before code).
// Traders Dynamic Index (Dean Malone). bandMult is listed in params but the rule does not use it.
export const meta = {
  id: "c1022-retail-35",
  name: "Traders Dynamic Index (TDI) fast/slow cross above 50",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  params: { rsi: 13, fast: 2, slow: 7, bandLen: 34, bandMult: 1.6185 },
};

// mean of the last n RSI(rsiLen) values ending at bar i; NaN until all exist
function rsiMean(ctx, i, n, rsiLen) {
  let s = 0;
  for (let j = i - n + 1; j <= i; j++) {
    if (j < 0) return NaN;
    const r = ctx.rsi(rsiLen, j);
    if (!Number.isFinite(r)) return NaN;
    s += r;
  }
  return s / n;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.pf = NaN; st.ps = NaN; }
  const fast = rsiMean(ctx, i, p.fast, p.rsi);
  const slow = rsiMean(ctx, i, p.slow, p.rsi);
  const base = rsiMean(ctx, i, p.bandLen, p.rsi);
  const pf = st.pf, ps = st.ps;
  st.pf = fast;
  st.ps = slow;
  if (![fast, slow, base, pf, ps].every(Number.isFinite)) return st.pos;
  if (st.pos === 0) {
    if (pf <= ps && fast > slow && fast > 50 && slow > base) st.pos = 1;
  } else if (fast < slow) {
    st.pos = 0;
  }
  return st.pos;
}
