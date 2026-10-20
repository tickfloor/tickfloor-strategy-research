// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-hns-s",
  "name": "Inverse head and shoulders: buy a close above the neckline, stop under the right shoulder, target neckline plus head depth (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "classic chart-pattern content (Bulkowski); TikTok/YouTube 'chart patterns you need to know'",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "L": 5,
    "headDepth": 0.03,
    "shoulderTol": 0.05,
    "span": 60,
    "armBars": 30,
    "maxHold": 40
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const L = P.L;
  if (!s.lows) { s.lows = []; s.highs = []; s.pos = 0; s.arm = null; }
  if (i >= 2 * L) {
    const j = i - L;
    let ph = true, pl = true;
    for (let k = j - L; k <= j + L; k++) {
      if (k === j) continue;
      if (bars[k].high >= bars[j].high) ph = false;
      if (bars[k].low <= bars[j].low) pl = false;
    }
    if (ph) { s.highs.push({ i: j, p: bars[j].high }); if (s.highs.length > 8) s.highs.shift(); }
    if (pl) {
      s.lows.push({ i: j, p: bars[j].low }); if (s.lows.length > 4) s.lows.shift();
      const n = s.lows.length;
      if (n >= 3 && s.pos === 0) {
        const a = s.lows[n - 3], h = s.lows[n - 2], c = s.lows[n - 1];
        const between = s.highs.filter((x) => x.i > a.i && x.i < c.i);
        if (h.p < a.p * (1 - P.headDepth) && h.p < c.p * (1 - P.headDepth) && Math.abs(c.p - a.p) / a.p < P.shoulderTol && c.i - a.i <= P.span && between.length >= 2) {
          const neck = Math.max(...between.map((x) => x.p));
          s.arm = { neck, stop: c.p, target: neck + (neck - h.p), born: i };
        }
      }
    }
  }
  const c = b.close;
  if (s.pos === 1) {
    s.held++;
    if (c < s.stop || c >= s.target || s.held >= P.maxHold) s.pos = 0;
  } else if (s.arm) {
    if (i - s.arm.born > P.armBars || c < s.arm.stop) s.arm = null;
    else if (c > s.arm.neck) { s.pos = 1; s.stop = s.arm.stop; s.target = s.arm.target; s.held = 0; s.arm = null; }
  }
  return s.pos;
}
