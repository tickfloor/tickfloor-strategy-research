// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-06). William O'Neil, How to Make Money in Stocks (2009), ch. 11 ('buy at the 50-day moving average').
export const meta = {
  id: "c1023-pop-06",
  name: "O'Neil 50-day line: buy the first pullback that touches a rising 50-day SMA above the 200-day, sell 3% below it",
  family: "momentum",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { fast: 50, slow: 200, touchPct: 0.01, cleanBars: 10, slopeBars: 10, exitPct: 0.03, maxBars: 30 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.at = 0; }
  let next = 0;
  if (i < p.slow + p.slopeBars) { st.pos = 0; return 0; }
  const s50 = ctx.sma("close", p.fast, i);
  if (st.pos === 1) {
    const exit = bars[i].close < (1 - p.exitPct) * s50 || i - st.at >= p.maxBars;
    next = exit ? 0 : 1;
  } else {
    const s200 = ctx.sma("close", p.slow, i);
    const rising = s50 > ctx.sma("close", p.fast, i - p.slopeBars);
    let clean = true;
    for (let k = i - p.cleanBars; k <= i - 1; k++) {
      if (!(bars[k].low > ctx.sma("close", p.fast, k))) { clean = false; break; }
    }
    const b = bars[i];
    const touch = b.low <= (1 + p.touchPct) * s50 && b.close > s50 && b.close > b.open;
    if (b.close > s200 && rising && clean && touch) {
      next = 1;
      st.at = i;
    }
  }
  st.pos = next;
  return next;
}
