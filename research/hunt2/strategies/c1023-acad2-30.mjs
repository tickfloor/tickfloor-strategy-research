// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-30). Portfolio rank mode, weekly.
// BTCUSDT is the market; BTC itself is never picked.
export const meta = {
  id: "c1023-acad2-30",
  name: "Crypto crash sensitivity to Bitcoin: long the 6 alts with the highest lower-tail dependence with BTC, weekly (Chabi-Yo-Ruenzi-Weigert transfer)",
  family: "volatility",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 613,
  params: { window: 365, tailPct: 0.05, topN: 6 },
};

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

function retAt(b, k) {
  const L = b.length;
  return b[L - 1 - k].close / b[L - 2 - k].close - 1;
}

// linear-interpolation percentile of a sorted array
function pct(sorted, p) {
  const pos = p * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function rank(universe, t, ctx) {
  const { window, tailPct, topN } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length <= 370) return {};
  const m = [];
  for (let k = 0; k < window; k++) m.push(retAt(btc, k));
  const qm = pct(m.slice().sort((x, y) => x - y), tailPct);
  const mTail = m.map((x) => x <= qm);
  let nm = 0;
  for (const f of mTail) if (f) nm++;
  if (nm === 0) return {};
  const scores = [];
  for (const sym of Object.keys(universe)) {
    if (sym === "BTCUSDT") continue;
    const b = universe[sym];
    if (b.length <= 370) continue;
    const r = [];
    for (let k = 0; k < window; k++) r.push(retAt(b, k));
    const qi = pct(r.slice().sort((x, y) => x - y), tailPct);
    let hit = 0;
    for (let k = 0; k < window; k++) if (r[k] <= qi && mTail[k]) hit++;
    scores.push([sym, hit / nm]);
  }
  return pickTop(scores, topN, true);
}
