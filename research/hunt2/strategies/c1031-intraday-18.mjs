// c1031-intraday-18: Ichimoku cloud breakout on hourly crypto (9/26/52, cloud displaced 26 bars).
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-18",
  name: "Ichimoku cloud breakout on hourly crypto (9/26/52)",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { tenkan: 9, kijun: 26, senkouB: 52, shift: 26 },
};

// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;
const mid = (ctx, n, j) => {
  const d = ctx.donchian(n, j);
  return (d.upper + d.lower) / 2;
};

export function signal(bars, i, ctx) {
  const { tenkan, kijun, senkouB, shift } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (!contig(bars, i, shift + senkouB)) { ctx.state.pos = 0; return 0; }
  const j = i - shift; // the cloud is displaced 26 bars forward, so only past bars feed it
  const spanA = (mid(ctx, tenkan, j) + mid(ctx, kijun, j)) / 2;
  const spanB = mid(ctx, senkouB, j);
  const top = Math.max(spanA, spanB);
  const bot = Math.min(spanA, spanB);
  const t = mid(ctx, tenkan, i);
  const k = mid(ctx, kijun, i);
  const c = bars[i].close;
  if (ctx.state.pos === 0) {
    if (c > top && t > k) ctx.state.pos = 1;
    else if (c < bot && t < k) ctx.state.pos = -1;
    return ctx.state.pos;
  }
  if ((ctx.state.pos === 1 && c < k) || (ctx.state.pos === -1 && c > k)) ctx.state.pos = 0;
  return ctx.state.pos;
}
