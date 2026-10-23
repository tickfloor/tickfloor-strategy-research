// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-49). Signal mode, long-short, 3-bar hold.

export const meta = {
  id: "c1022-crypto-49",
  name: "Daily Garman-Klass volatility expansion continuation",
  family: "volatility",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: true,
  holdBars: 3,
  params: { win: 30, mult: 2.0 },
};

// Garman-Klass variance estimate for one daily bar
function gk(b) {
  const hl = Math.log(b.high / b.low);
  const co = Math.log(b.close / b.open);
  return 0.5 * hl * hl - (2 * Math.LN2 - 1) * co * co;
}

export function signal(bars, i, ctx) {
  const { win, mult } = ctx.params;
  if (i < win) return 0;
  // median of gk over the win bars before bar i
  const vals = [];
  for (let j = i - win; j < i; j++) vals.push(gk(bars[j]));
  vals.sort((a, b) => a - b);
  const med = (vals[win / 2 - 1] + vals[win / 2]) / 2;
  const g = gk(bars[i]);
  if (!(g >= mult * med)) return 0;
  const b = bars[i];
  return b.close > b.open ? 1 : b.close < b.open ? -1 : 0;
}
