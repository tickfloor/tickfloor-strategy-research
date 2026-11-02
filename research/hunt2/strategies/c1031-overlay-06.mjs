// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-06). Ji, Bouri, Lau & Roubaud (2019) IRFA 63; Diebold & Yilmaz (2012) IJF 28(1)
export const meta = {
  id: "c1031-overlay-06",
  name: "Bitcoin crash brake: all coins to cash for 14 days after BTC falls 15% over 7 days",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  longShort: false,
  params: { dropLookback: 7, dropThreshold: -0.15, standDownBars: 14, need: 2 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  const a = universe.BTCUSDT;
  if (!a) return {};
  const ba = a.length - 1;
  // crash day k: a[k] vs a[k - dropLookback]; the 14 most recent BTC bars, needs ba >= 20 for the first one
  const from = ba - (p.standDownBars - 1);
  let crash = false;
  if (from - p.dropLookback >= 0) {
    for (let k = from; k <= ba; k++) {
      if (a[k].close / a[k - p.dropLookback].close - 1 <= p.dropThreshold) { crash = true; break; }
    }
  }
  const w = {};
  for (const s of syms) w[s] = (crash ? 0 : 1) / N;
  return w;
}
