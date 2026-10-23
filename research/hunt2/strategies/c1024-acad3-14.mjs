// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-14). Zhang & Li 2023, IJFE 28(1); Amihud 2002, JFM 5(1)
export const meta = {
  id: "c1024-acad3-14",
  name: "Crypto illiquidity premium: long the 6 coins with the highest 30-day Amihud price impact, weekly (Zhang-Li; Amihud)",
  family: "other",
  source: "c1024/acad3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 30, top: 6 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 31) continue;
    let sum = 0, cnt = 0;
    for (let k = L - p.window; k <= L - 1; k++) {
      const bar = b[k];
      if (!(bar.volume > 0)) continue;
      const v = (Math.abs(bar.close / b[k - 1].close - 1) / (bar.close * bar.volume)) * 1e6;
      if (Number.isFinite(v)) { sum += v; cnt++; }
    }
    if (cnt < 20) continue;
    names.push({ sym, illiq: sum / cnt });
  }
  const S = names.length;
  const picks = Math.min(p.top, S);
  if (picks < 3) return {};
  names.sort((a, b) => b.illiq - a.illiq || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of names.slice(0, picks)) w[x.sym] = 1 / p.top; // spec: 1/top each (cash for missing slots)
  return w;
}
