// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-14). Brock-Lakonishok-LeBaron 1992, JF 47(5); Keltner 1960
export const meta = {
  id: "c1031-overlay-14",
  name: "ATR-band trend filter with hysteresis on 25 ETFs: in above SMA100 + 1 ATR, out below SMA100 - 1 ATR",
  family: "trend-filter",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: false,
  params: { smaWin: 100, atrWin: 20, bandAtr: 1 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.on === undefined) ctx.state.on = 0;
  if (i < 120) return 0;
  const m = ctx.sma("close", p.smaWin, i);
  const a = ctx.atr(p.atrWin, i);
  if (!Number.isFinite(m) || !Number.isFinite(a)) return 0;
  const c = bars[i].close;
  if (ctx.state.on === 0 && c > m + p.bandAtr * a) ctx.state.on = 1;
  else if (ctx.state.on === 1 && c < m - p.bandAtr * a) ctx.state.on = 0;
  return ctx.state.on;
}
