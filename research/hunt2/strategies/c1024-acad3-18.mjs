// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-18). Copeland & Copeland 1999, FAJ 55(2), 73-81 (transfer to crypto)
export const meta = {
  id: "c1024-acad3-18",
  name: "Crypto size rotation on VIX changes: Bitcoin only in weeks after the VIX rose, equal-weight alts after it fell (Copeland-Copeland transfer)",
  family: "macro",
  source: "c1024/acad3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { maxHist: 8 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.hist === undefined) st.hist = [];
  st.hist.push(ctx.macro("VIX"));
  if (st.hist.length > p.maxHist) st.hist.shift();
  const f = st.hist.filter((x) => Number.isFinite(x));
  if (f.length < 2) return {};
  const up = f[f.length - 1] > f[f.length - 2];
  if (up) return Object.hasOwn(universe, "BTCUSDT") ? { BTCUSDT: 1 } : {};
  const alts = Object.keys(universe).filter((s) => s !== "BTCUSDT");
  if (alts.length === 0) return {};
  const w = {};
  for (const s of alts) w[s] = 1 / alts.length;
  return w;
}
