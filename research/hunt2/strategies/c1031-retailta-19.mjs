// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-19). Bull flag breakout after a 15% ten-day pole.
// Pole = bars base..last (last = i-flag-1, base = last-pole); flag = bars i-flag..i-1; breakout = close above the flag high.
export const meta = {
  id: "c1031-retailta-19",
  name: "Bull flag breakout: 15% ten-day pole, five-bar shallow flag, close above the flag high",
  family: "chart-structure",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { pole: 10, poleGain: 0.15, flag: 5, maxRange: 0.15, maxRetrace: 0.5, maxHold: 15 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0;
    st.entry = -1;
    st.stop = NaN;
  }
  const p = ctx.params;
  if (st.pos === 1) {
    if (bars[i].close < st.stop || i - st.entry >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  const last = i - p.flag - 1;
  const base = last - p.pole;
  if (base < 0) return 0;

  const c0 = bars[last].close;
  const c1 = bars[base].close;
  if (!(c0 / c1 - 1 >= p.poleGain)) return 0;

  let poleHi = -Infinity;
  for (let k = base; k <= last; k++) poleHi = Math.max(poleHi, bars[k].high);
  let flagHi = -Infinity;
  let flagLo = Infinity;
  for (let k = i - p.flag; k <= i - 1; k++) {
    flagHi = Math.max(flagHi, bars[k].high);
    flagLo = Math.min(flagLo, bars[k].low);
  }
  const shallow =
    flagHi <= 1.02 * poleHi &&
    flagLo >= c0 - p.maxRetrace * (c0 - c1) &&
    (flagHi - flagLo) / c0 <= p.maxRange;
  if (!shallow || !(bars[i].close > flagHi)) return 0;

  st.pos = 1;
  st.entry = i;
  st.stop = flagLo;
  return 1;
}
