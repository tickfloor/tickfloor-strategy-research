// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-01). Daniel & Moskowitz 2016, 'Momentum crashes', Journal of Financial Economics 122(2), 221-247
export const meta = {
  id: "c1022-acad-01",
  name: "Momentum crash gate: 12-1 momentum scaled down in bear + high-vol states (Daniel-Moskowitz)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 252, skip: 21, topFrac: 0.2, bearLookback: 504, volWindow: 126, volThresholdAnn: 0.25 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 505) continue;
    names.push({ sym, b, mom: b[L - 1 - p.skip].close / b[L - 1 - p.form].close - 1 });
  }
  const E = names.length;
  const k = Math.floor(p.topFrac * E);
  if (k < 3) return {};
  // EW market daily return at offset d back from t (d = 0 is day t)
  const ew = (d) => names.reduce((s, n) => s + n.b[n.b.length - 1 - d].close / n.b[n.b.length - 2 - d].close - 1, 0) / E;
  let growth = 1;
  for (let d = 0; d < p.bearLookback; d++) growth *= 1 + ew(d);
  const rets = [];
  for (let d = 0; d < p.volWindow; d++) rets.push(ew(d));
  const m = rets.reduce((s, x) => s + x, 0) / rets.length;
  const vol = Math.sqrt(rets.reduce((s, x) => s + (x - m) ** 2, 0) / rets.length) * Math.sqrt(252);
  const bear = growth - 1 < 0;
  const highVol = vol > p.volThresholdAnn;
  const s = 1 - 0.5 * (Number(bear) + Number(highVol));
  if (s === 0) return {};
  names.sort((a, b) => b.mom - a.mom || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const n of names.slice(0, k)) w[n.sym] = s / k;
  return w;
}
