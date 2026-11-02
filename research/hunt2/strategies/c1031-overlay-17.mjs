// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-17). Kaminski & Lo 2014, Journal of Financial Markets 18
// ponytail: universe name used instead of the spec's identical assets list (harness forbids both keys).
export const meta = {
  id: "c1031-overlay-17",
  name: "Quarterly loss limit with reset: an ETF is cut to zero for the rest of a quarter once it closes 10% below the prior quarter-end close",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { limit: 0.1, need: 70 },
};

const quarterKey = (time) => {
  const d = new Date(time * 1000);
  return d.getUTCFullYear() * 4 + Math.floor(d.getUTCMonth() / 3);
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < p.need) continue;
    const e = L - 1;
    const qe = quarterKey(b[e].time);
    let j = e - 1;
    while (j >= 0 && quarterKey(b[j].time) === qe) j--;
    if (j < 0) continue;
    const q0 = b[j].close;
    let mn = Infinity;
    for (let k = j + 1; k <= e; k++) if (b[k].close < mn) mn = b[k].close;
    scored.push({ sym, x: mn < q0 * (1 - p.limit) ? 0 : 1 });
  }
  const N = scored.length;
  if (N === 0) return {};
  const w = {};
  for (const s of scored) w[s.sym] = s.x / N;
  return w;
}
