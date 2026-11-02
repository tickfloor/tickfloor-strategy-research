// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-18). Faber (2007) JWM 9(4); Brock, Lakonishok & LeBaron (1992) Journal of Finance 47(5)
export const meta = {
  id: "c1031-overlay-18",
  name: "Own-composite trend gate on 40 large caps: hold all 40 only while their equal-weight index is above its 150-day average, daily",
  family: "trend-filter",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "daily",
  longShort: false,
  warmup: 211,
  params: { smaWin: 150, chainBars: 210, need: 211 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  // lv[d] = composite level d bars before the rebalance day e; lv[chainBars-1] = C_{e-209} = 1
  const lv = new Array(p.chainBars).fill(0);
  lv[p.chainBars - 1] = 1;
  for (let d = p.chainBars - 2; d >= 0; d--) {
    let mr = 0;
    for (const s of syms) {
      const b = universe[s];
      const k = b.length - 1 - d;
      mr += b[k].close / b[k - 1].close - 1;
    }
    lv[d] = lv[d + 1] * (1 + mr / N);
  }
  let m = 0;
  for (let d = 0; d < p.smaWin; d++) m += lv[d];
  m /= p.smaWin;
  const gate = lv[0] > m ? 1 : 0;
  const w = {};
  for (const s of syms) w[s] = gate / N;
  return w;
}
