// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-relative-vigor-rank). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-relative-vigor-rank__rob1",
  "name": "Does buying crypto with the strongest Relative Vigor Index work? (-25%)",
  "family": "indicator-relative-vigor",
  "source": "retail trading content: Relative Vigor Index RVI crypto strength ranking",
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
  "longShort": false,
  "params": {
    "averagePeriod": 10,
    "fourBarWeights": [
      1,
      2,
      2,
      1
    ],
    "topN": 4,
    "minScore": 0,
    "warmupBars": 16
  },
  "rebalance": "weekly"
};

export function rank(universe, t, ctx) {
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < 16) continue;
    const n = b.length;
    let sa = 0, sb = 0;
    for (let k = n - 8; k < n; k++) {
      const co = (j) => b[j].close - b[j].open;
      const hl = (j) => b[j].high - b[j].low;
      sa += (co(k) + 2 * co(k - 1) + 2 * co(k - 2) + co(k - 3)) / 6;
      sb += (hl(k) + 2 * hl(k - 1) + 2 * hl(k - 2) + hl(k - 3)) / 6;
    }
    const sc = sa / sb;
    if (!Number.isFinite(sa) || !Number.isFinite(sb) || sb === 0 || !Number.isFinite(sc) || sc <= 0) continue;
    scores.push([sym, sc]);
  }
  scores.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = scores.slice(0, 4);
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}

