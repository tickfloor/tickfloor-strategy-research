// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-confsrm-c",
  "name": "Stochastic + RSI + MACD confluence: %K crosses above %D under 80 with RSI>50 and MACD above signal; exit when MACD turns down (crypto 1d x18)",
  "family": "top100-1006",
  "source": "YouTube Data Trader 'Highly Profitable Stochastic + RSI + MACD Trading Strategy'; channel videos 100K to 1.7M views",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "fast": 12,
    "slow": 26,
    "sig": 9,
    "rsi": 14,
    "st": 14
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const m = ctx.ema("close", P.fast) - ctx.ema("close", P.slow);
  if (!(m === m)) return 0;
  s.sig = s.sig === undefined ? m : s.sig + (2 / (P.sig + 1)) * (m - s.sig);
  s.k = (s.k || 0) + 1;
  if (s.k < P.sig) return 0;
  const hist = m - s.sig;
  const r = ctx.rsi(P.rsi), d = ctx.donchian(P.st);
  if (!(r === r) || !d || !(d.upper === d.upper)) return 0;
  const raw = d.upper > d.lower ? (100 * (b.close - d.lower)) / (d.upper - d.lower) : 50;
  if (!s.rk) s.rk = [];
  if (!s.kk) s.kk = [];
  s.rk.push(raw); if (s.rk.length > 3) s.rk.shift();
  if (s.rk.length < 3) return 0;
  const K = (s.rk[0] + s.rk[1] + s.rk[2]) / 3;
  s.kk.push(K); if (s.kk.length > 3) s.kk.shift();
  if (s.kk.length < 3) return 0;
  const D = (s.kk[0] + s.kk[1] + s.kk[2]) / 3;
  const crossUp = s.pK !== undefined && s.pK <= s.pD && K > D;
  s.pK = K; s.pD = D;
  if (s.pos === undefined) s.pos = 0;
  if (s.pos === 0 && crossUp && K < 80 && r > 50 && hist > 0) s.pos = 1;
  else if (s.pos === 1 && hist <= 0) s.pos = 0;
  return s.pos;
}
