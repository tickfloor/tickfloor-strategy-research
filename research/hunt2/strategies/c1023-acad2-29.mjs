// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-29). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-29",
  name: "Crypto momentum gap: 3-week momentum top 6 only when the winner-loser spread is below its historical median, weekly (Huang transfer)",
  family: "momentum",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 335,
  params: { form: 21, topN: 6, gapHi: 0.9, gapLo: 0.1, minHistory: 26 },
};

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

// linear-interpolation percentile of a sorted array
function pct(sorted, p) {
  const pos = p * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

export function rank(universe, t, ctx) {
  const { form, topN, gapHi, gapLo, minHistory } = ctx.params;
  if (ctx.state.gaps === undefined) ctx.state.gaps = [];
  const cands = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 25) continue;
    cands.push([sym, b[L - 1].close / b[L - 1 - form].close - 1]);
  }
  if (cands.length < 3) return {}; // no gap observation, nothing pushed
  const moms = cands.map((c) => c[1]).sort((x, y) => x - y);
  const gap = pct(moms, gapHi) - pct(moms, gapLo);
  const hist = ctx.state.gaps;
  let w = {};
  if (hist.length >= minHistory && gap <= median(hist)) w = pickTop(cands, topN, true);
  hist.push(gap); // pushed after deciding
  return w;
}
