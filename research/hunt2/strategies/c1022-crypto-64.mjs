// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-64). Frozen before code.
export const meta = {
  id: "c1022-crypto-64",
  name: "Hourly return autocorrelation regime: momentum when positive, reversal when negative",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 24,
  params: { win: 168, th: 0.05, retLb: 24, hold: 24 },
};

// ac = lag-1 autocorrelation of the last `win` hourly simple returns (full-window mean).
// Position = sign of the last retLb-bar return if ac >= th; the negated sign if ac <= -th; else flat.
export function signal(bars, i, ctx) {
  const { win, th, retLb } = ctx.params;
  if (i < win) return 0;
  const r = [];
  for (let k = i - win + 1; k <= i; k++) r.push(bars[k].close / bars[k - 1].close - 1);
  let m = 0;
  for (const x of r) m += x;
  m /= win;
  let num = 0;
  let den = 0;
  for (let t = 0; t < win; t++) {
    den += (r[t] - m) * (r[t] - m);
    if (t > 0) num += (r[t] - m) * (r[t - 1] - m);
  }
  const ac = num / den;
  const rl = bars[i].close / bars[i - retLb].close - 1;
  const sg = rl > 0 ? 1 : rl < 0 ? -1 : 0;
  if (ac >= th) return sg;
  if (ac <= -th) return sg === 0 ? 0 : -sg;
  return 0;
}
