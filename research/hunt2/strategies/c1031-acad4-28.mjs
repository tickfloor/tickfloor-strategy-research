// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-28). Chordia, Subrahmanyam & Anshuman 2001, Journal of Financial Economics 59(1), 3-32
export const meta = {
  id: "c1031-acad4-28",
  name: "Crypto stable-volume premium: long the 6 coins with the lowest coefficient of variation of dollar volume over 90 days, weekly (Chordia-Subrahmanyam-Anshuman transfer)",
  family: "volatility",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 90, top: 6 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < p.window + 1) continue;
    const dv = [];
    for (let k = e - p.window + 1; k <= e; k++) dv.push(b[k].close * b[k].volume);
    const mean = dv.reduce((s, x) => s + x, 0) / p.window;
    if (!(mean > 0)) continue;
    const sd = Math.sqrt(dv.reduce((s, x) => s + (x - mean) ** 2, 0) / (p.window - 1));
    scored.push([sym, sd / mean]);
  }
  if (scored.length < p.top) return {};
  scored.sort((u, v) => u[1] - v[1] || (u[0] < v[0] ? -1 : u[0] > v[0] ? 1 : 0));
  const w = {};
  for (const [sym] of scored.slice(0, p.top)) w[sym] = 1 / p.top;
  return w;
}
