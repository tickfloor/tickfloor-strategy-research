// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-19). Liu & Tsyvinski 2021, RFS 34(6); Bali-Cakici-Whitelaw 2011, JFE 99(2)
// ponytail: universe name used instead of the spec's identical assets list (harness forbids both keys).
export const meta = {
  id: "c1031-overlay-19",
  name: "Crypto blow-off trim: a coin is held at half weight while it is more than 50% above its level 14 days ago",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { lookback: 14, trigger: 0.5, trimTo: 0.5, need: 15 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L < p.need) continue;
    const e = L - 1;
    const ret = b[e].close / b[e - p.lookback].close - 1;
    scored.push({ sym, x: ret > p.trigger ? p.trimTo : 1 });
  }
  const N = scored.length;
  if (N === 0) return {};
  const w = {};
  for (const s of scored) w[s.sym] = s.x / N;
  return w;
}
