// Spec: research/hunt2/campaign-1022/prereg-retail.json (c1022-retail-09). Frozen before code.
export const meta = {
  id: "c1022-retail-09",
  name: "MACD signal cross taken only above the zero line",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: {"fast": 12, "slow": 26, "signal": 9},
};

// MACD(12,26,9): line via ctx.ema; signal = custom EMA9 (alpha 2/10, seeded with first valid line).
// Must be called once per bar, in order, before reading lines/sigs.
function macdAt(ctx, i) {
  const s = ctx.state;
  if (s.lines === undefined) { s.lines = []; s.sigs = []; }
  const line = ctx.ema("close", 12, i) - ctx.ema("close", 26, i);
  let sig = NaN;
  if (!Number.isNaN(line)) {
    const ps = i > 0 ? s.sigs[i - 1] : NaN;
    sig = Number.isNaN(ps) ? line : ps + (2 / 10) * (line - ps);
  }
  s.lines.push(line);
  s.sigs.push(sig);
}

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  macdAt(ctx, i);
  const L = ctx.state.lines, G = ctx.state.sigs;
  const l = L[i], g = G[i];
  const lp = i > 0 ? L[i - 1] : NaN, gp = i > 0 ? G[i - 1] : NaN;
  if (s.pos === 1) {
    if (l < g) s.pos = 0;
  } else if (lp <= gp && l > g && l > 0) {
    s.pos = 1;
  }
  return s.pos;
}
