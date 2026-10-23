// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-11). Mebane Faber, 'A Quantitative Approach to Tactical Asset Allocation' (2007), 10-month SMA timing.
export const meta = {
  id: "c1023-pop-11",
  name: "Faber 10-month SMA timing on crypto: long when the monthly close is above the 10-month average, cash otherwise",
  family: "trend",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1d",
  params: { months: 10 },
};

// Decisions only on the first daily bar after a new complete month; otherwise the position is held.
// Review fix: drop the month containing bar i, so a crypto month's last bar (already complete=true) does not
// decide; the decision lands on the first bar of the next month, as the spec says.
export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.nMonths = 0; }
  const months = ctx.resample(bars, "1M").slice(0, -1);
  if (months.length === st.nMonths) return st.pos;
  st.nMonths = months.length;
  const n = months.length;
  if (n < p.months) return st.pos;
  let sum = 0;
  for (let k = n - p.months; k < n; k++) sum += months[k].close;
  const avg = sum / p.months, mc = months[n - 1].close;
  if (st.pos === 0 && mc > avg) st.pos = 1;
  else if (st.pos === 1 && mc <= avg) st.pos = 0;
  return st.pos;
}
