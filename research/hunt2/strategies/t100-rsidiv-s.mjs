// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-rsidiv-s",
  "name": "Bullish RSI divergence: lower low in price, higher low in RSI(14) under 40, 10-day hold (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "TradingView RSI-divergence scripts; YouTube Data Trader 'MACD divergence' 116.9K views; hourly crypto version already tested (s29-h-rsi-divergence)",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "L": 5,
    "span": 40,
    "maxRsi": 40,
    "hold": 10
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  if (s.pos === undefined) s.pos = 0;
  if (s.pos === 1) { s.held++; if (s.held >= P.hold) s.pos = 0; return s.pos; }
  const L = P.L;
  if (i < 2 * L + 20) return 0;
  const j = i - L;
  let pl = true;
  for (let k = j - L; k <= j + L; k++) if (k !== j && bars[k].close <= bars[j].close) pl = false;
  if (!pl) return 0;
  const r = ctx.rsi(14, j);
  if (!(r === r)) return 0;
  const prev = s.pv;
  s.pv = { i: j, p: bars[j].close, r };
  if (prev && j - prev.i <= P.span && bars[j].close < prev.p && r > prev.r && r < P.maxRsi) { s.pos = 1; s.held = 0; }
  return s.pos;
}
