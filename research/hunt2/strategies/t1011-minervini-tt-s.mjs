// tests-1011 (lane l-tests-1011). Pre-registered in docs/research/tests-1011/prereg.md before any run.
export const meta = {
  id: "t1011-minervini-tt-s",
  name: "Minervini Trend Template: equal-weight monthly qualifiers of all 8 rules, US stocks wide x171",
  family: "tests-1011",
  source: "Mark Minervini, Trade Like a Stock Market Wizard (Trend Template); TradingView 'trend template' screens",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  warmup: 252, // amendment 2026-10-11: scored from day 253 of the universe calendar, rule and benchmark alike
  params: { rsBars: 126, rsTop: 0.3, lowMult: 1.3, highMult: 0.75, yearBars: 252, risingBars: 20 },
};
export function rank(universe, t, ctx) {
  const p = ctx.params;
  const N = p.yearBars + 1;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < N) continue;
    const L = b.length;
    elig.push({ sym, b, L, rs: b[L - 1].close / b[L - 1 - p.rsBars].close - 1 });
  }
  if (elig.length < 10) return {};
  const byRs = elig.map((e) => e.rs).sort((x, y) => y - x);
  const cut = byRs[Math.ceil(elig.length * p.rsTop) - 1]; // top 30% (ties included)
  const sma = (b, L, n, end) => { let s = 0; for (let k = end - n; k < end; k++) s += b[k].close; return s / n; };
  const pass = [];
  for (const e of elig) {
    const { b, L } = e;
    const c = b[L - 1].close;
    const s50 = sma(b, L, 50, L), s150 = sma(b, L, 150, L), s200 = sma(b, L, 200, L);
    const s200Prev = sma(b, L, 200, L - p.risingBars);
    let lo = Infinity, hi = -Infinity;
    for (let k = L - p.yearBars; k < L; k++) { if (b[k].low < lo) lo = b[k].low; if (b[k].high > hi) hi = b[k].high; }
    if (c > s150 && c > s200 && s150 > s200 && s200 > s200Prev && s50 > s150 && s150 > s200 && c > s50 &&
        c >= p.lowMult * lo && c >= p.highMult * hi && e.rs >= cut) pass.push(e.sym);
  }
  const w = {};
  for (const s of pass) w[s] = 1 / pass.length;
  return w;
}
