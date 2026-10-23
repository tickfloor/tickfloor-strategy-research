// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-10). Copeland & Copeland 1999, Financial Analysts Journal 55(2), 73-81
export const meta = {
  id: "c1024-acad3-10",
  name: "VIX-change style rotation: DIA when the VIX rose over the past week, QQQ when it fell, weekly (Copeland-Copeland)",
  family: "macro",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  params: { lookback: 5 },
};

const fin = (x) => typeof x === "number" && Number.isFinite(x);
// Monday-start week index of a UTC day (spec formula)
const wk = (t) => Math.floor((Math.floor(t / 86400) + 3) / 7);

export function signal(bars, i, ctx) {
  const L = ctx.params.lookback;
  if (ctx.state.hold === undefined) ctx.state.hold = 0;
  if (i >= 6 && wk(bars[i].time) !== wk(bars[i - 1].time)) {
    const v = ctx.macro("VIX", i);
    const v5 = ctx.macro("VIX", i - L);
    const up = fin(v) && fin(v5) && v > v5;
    ctx.state.hold = ctx.symbol === "DIA" ? (up ? 1 : 0) : (up ? 0 : 1);
  }
  return ctx.state.hold;
}
