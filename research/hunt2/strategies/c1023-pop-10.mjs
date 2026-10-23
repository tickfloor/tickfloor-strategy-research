// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-10). Stan Weinstein, Secrets for Profiting in Bull and Bear Markets (1988), ch. 2-3.
export const meta = {
  id: "c1023-pop-10",
  name: "Weinstein stage analysis on weekly bars: Stage 2 above a rising 30-week MA, exit only when price is below a flat-or-falling MA (Stage 4)",
  family: "trend",
  source: "c1023/pop",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  params: { maWeeks: 30, slopeWeeks: 4 },
};

// Decisions only on the first daily bar after a new complete week; otherwise the position is held.
export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.nWeeks = 0; }
  const weeks = ctx.resample(bars, "1w").filter((w) => w.complete);
  if (weeks.length === st.nWeeks) return st.pos;
  st.nWeeks = weeks.length;
  const closes = weeks.map((w) => w.close);
  const n = closes.length;
  if (n < p.maWeeks + p.slopeWeeks) return st.pos;
  const sma = (end) => {
    let s = 0;
    for (let k = end - p.maWeeks + 1; k <= end; k++) s += closes[k];
    return s / p.maWeeks;
  };
  const m = sma(n - 1), mPrev = sma(n - 1 - p.slopeWeeks);
  const rising = m > mPrev;
  const wc = closes[n - 1];
  if (st.pos === 0 && wc > m && rising) st.pos = 1;
  else if (st.pos === 1 && wc < m && !rising) st.pos = 0;
  return st.pos;
}
