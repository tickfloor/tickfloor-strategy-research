export const meta = {
  "id": "c1022-crypto-01",
  "name": "Goldilocks funding regime: long only while 30-day funding is positive but not euphoric",
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
  "params": {
    "n": 30,
    "lo": 0.0,
    "hi": 0.0005,
    "sma": 100
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.fd === undefined) ctx.state.fd = [];
  const buf = ctx.state.fd;
  const fd = ctx.fundingRate(i);
  buf.push(fd);
  if (buf.length > p.n) buf.shift();
  if (fd === null || buf.length < p.n) return 0; // null funding -> 0 (spec)
  let sum = 0, cnt = 0;
  for (const v of buf) if (v !== null) { sum += v; cnt++; } // skip nulls
  if (cnt < p.n / 2) return 0;
  const m = sum / cnt;
  return m > p.lo && m <= p.hi && bars[i].close > ctx.sma("close", p.sma, i) ? 1 : 0;
}
