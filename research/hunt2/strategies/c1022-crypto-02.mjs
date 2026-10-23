export const meta = {
  "id": "c1022-crypto-02",
  "name": "Negative funding percentile dip inside an uptrend (shorts pay while trend intact)",
  "family": "carry",
  "source": "c1022/crypto",
  "assetClass": "crypto",
  "timeframe": "1d",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT",
    "BCHUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "DASHUSDT",
    "ZECUSDT",
    "AVAXUSDT",
    "UNIUSDT",
    "NEARUSDT",
    "AAVEUSDT",
    "HBARUSDT"
  ],
  "holdBars": 10,
  "params": {
    "pctWin": 365,
    "pct": 0.1,
    "sma": 200,
    "hold": 10
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.fd === undefined) ctx.state.fd = [];
  const buf = ctx.state.fd;
  const fd = ctx.fundingRate(i);
  if (fd === null) return 0; // null funding -> 0 (spec); nulls never enter the ring
  // percentile over the prior ring (current bar not in it), then push the current value
  let trig = false;
  if (buf.length === p.pctWin) {
    const sorted = [...buf].sort((a, b) => a - b);
    trig = fd < sorted[Math.floor(p.pct * sorted.length)] && bars[i].close > ctx.sma("close", p.sma, i);
  }
  buf.push(fd);
  if (buf.length > p.pctWin) buf.shift();
  return trig ? 1 : 0;
}
