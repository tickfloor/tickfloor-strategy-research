// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-bos-h",
  "name": "Market structure: long after higher high and higher low, short after lower high and lower low (2-bar fractals) (crypto 1h x8)",
  "family": "top100-1006",
  "source": "SMC / market-structure content (BOS, CHoCH), TradingView SMC 78.2K likes, Reddit ICT/SMC 240 posts",
  "assetClass": "crypto",
  "timeframe": "1h",
  "longShort": true,
  "params": {
    "L": 2
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const L = P.L;
  if (i < 2 * L + 1) return 0;
  const j = i - L;
  let ph = true, pl = true;
  for (let k = j - L; k <= j + L; k++) {
    if (k === j) continue;
    if (bars[k].high >= bars[j].high) ph = false;
    if (bars[k].low <= bars[j].low) pl = false;
  }
  if (!s.SH) { s.SH = []; s.SL = []; }
  if (ph) { s.SH.push(bars[j].high); if (s.SH.length > 2) s.SH.shift(); }
  if (pl) { s.SL.push(bars[j].low); if (s.SL.length > 2) s.SL.shift(); }
  if (s.SH.length < 2 || s.SL.length < 2) return 0;
  if (s.SH[1] > s.SH[0] && s.SL[1] > s.SL[0]) return 1;
  if (s.SH[1] < s.SH[0] && s.SL[1] < s.SL[0]) return -1;
  return 0;
}
