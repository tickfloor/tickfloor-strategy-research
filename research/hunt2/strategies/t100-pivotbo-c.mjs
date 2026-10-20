// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-pivotbo-c",
  "name": "Support/resistance break: buy a close above the last 15-bar pivot high, exit under the last pivot low (crypto 1d x18)",
  "family": "top100-1006",
  "source": "TradingView Support and Resistance Levels with Breaks [LuxAlgo] 33.8K likes; Swing high/low S/R 33.8K",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "L": 15
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const L = P.L;
  if (i < 2 * L) return 0;
  const j = i - L;
  let ph = true, pl = true;
  for (let k = j - L; k <= j + L; k++) {
    if (k === j) continue;
    if (bars[k].high >= bars[j].high) ph = false;
    if (bars[k].low <= bars[j].low) pl = false;
  }
  if (ph) s.ph = bars[j].high;
  if (pl) s.pl = bars[j].low;
  if (s.pos === undefined) s.pos = 0;
  const c = b.close;
  if (s.pos === 0 && s.ph !== undefined && c > s.ph && (s.pl === undefined || c >= s.pl)) s.pos = 1;
  else if (s.pos === 1 && s.pl !== undefined && c < s.pl) s.pos = 0;
  return s.pos;
}
