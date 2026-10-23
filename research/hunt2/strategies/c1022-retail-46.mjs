// c1022 retail spec 46 (campaign-1022/prereg-retail.json, frozen before code).
// Al Brooks H2: pullback leg (lower high) -> H1 (higher high) -> lower high -> H2 (higher high) above EMA20.
export const meta = {
  id: "c1022-retail-46",
  name: "Al Brooks H2 second-entry buy above the 20 EMA",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { ema: 20, trendBars: 10, atr: 14, targetR: 2, maxHold: 15 },
};

// phase 0 idle; 1 leg started, waiting H1; 2 H1 seen, waiting a lower high; 3 waiting H2
export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) {
    st.pos = 0; st.held = 0; st.phase = 0; st.legStart = 0; st.legLow = Infinity; st.stop = NaN; st.target = NaN;
  }
  if (i < 1) return 0;
  const c = b[i].close;

  if (st.pos === 1) {
    st.held++;
    if (c < st.stop || c >= st.target || st.held >= p.maxHold) st.pos = 0;
    return st.pos;
  }

  const e = ctx.ema("close", p.ema, i);
  if (!Number.isFinite(e)) return 0;
  if (c < e) { st.phase = 0; st.legLow = Infinity; return 0; }
  if (st.phase !== 0 && i - st.legStart > 20) { st.phase = 0; st.legLow = Infinity; }

  const up = b[i].high > b[i - 1].high;
  const down = b[i].high < b[i - 1].high;
  if (st.phase === 0) {
    if (down) { st.phase = 1; st.legStart = i; st.legLow = b[i].low; }
    return 0;
  }
  st.legLow = Math.min(st.legLow, b[i].low);
  if (st.phase === 1) { if (up) st.phase = 2; return 0; }
  if (st.phase === 2) { if (down) st.phase = 3; return 0; }

  // phase 3: an up bar here is H2
  if (!up) return 0;
  st.phase = 0;
  let trend = true;
  for (let j = i - p.trendBars + 1; j <= i; j++) {
    if (!(b[j].close > ctx.ema("close", p.ema, j))) { trend = false; break; }
  }
  if (!trend) return 0;
  st.pos = 1;
  st.held = 0;
  st.stop = st.legLow;
  st.target = c + p.targetR * (c - st.stop);
  st.legLow = Infinity;
  return 1;
}
