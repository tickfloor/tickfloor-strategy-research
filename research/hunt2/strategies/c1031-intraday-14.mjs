// c1031-intraday-14: Keltner channel breakout on hourly crypto (EMA24 +/- 2.5 ATR24).
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-14",
  name: "Keltner channel breakout on hourly crypto (EMA24 +/- 2.5 ATR24)",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { emaBars: 24, atrBars: 24, mult: 2.5 },
};

export function signal(bars, i, ctx) {
  const { emaBars, atrBars, mult } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const c = bars[i].close;
  const e = ctx.ema("close", emaBars, i);
  const a = ctx.atr(atrBars, i);
  if (ctx.state.pos === 0) {
    if (c > e + mult * a) ctx.state.pos = 1;
    else if (c < e - mult * a) ctx.state.pos = -1;
    return ctx.state.pos;
  }
  if ((ctx.state.pos === 1 && c < e) || (ctx.state.pos === -1 && c > e)) ctx.state.pos = 0;
  return ctx.state.pos;
}
