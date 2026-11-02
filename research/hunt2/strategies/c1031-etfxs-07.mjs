// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-07). Average-correlation regime switch on sectors (momentum when dispersed, low-vol when crowded).
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-07",
  name: "Average-correlation regime switch on sectors: momentum when correlation is low, low-volatility when it is high",
  family: "other",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  longShort: false,
  params: { corrWindow: 63, medianLags: 12, top: 3 },
};

// Daily returns for the n bars ending at index (e - off).
function retsAt(b, off, n) {
  const e = b.length - 1 - off;
  const out = [];
  for (let k = e - n + 1; k <= e; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function mean(a) {
  let s = 0;
  for (const x of a) s += x;
  return s / a.length;
}

function sampleCov(x, y) {
  const mx = mean(x);
  const my = mean(y);
  let s = 0;
  for (let k = 0; k < x.length; k++) s += (x[k] - mx) * (y[k] - my);
  return s / (x.length - 1);
}

function sampleStd(a) {
  return Math.sqrt(sampleCov(a, a));
}

// Mean pairwise Pearson correlation of the sectors' daily returns over the window ending at offset `off`.
function avgCorr(B, off, n) {
  const R = B.map((b) => retsAt(b, off, n));
  let s = 0;
  let c = 0;
  for (let i = 0; i < R.length; i++) {
    for (let j = i + 1; j < R.length; j++) {
      s += sampleCov(R[i], R[j]) / (sampleStd(R[i]) * sampleStd(R[j]));
      c++;
    }
  }
  return s / c;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 316).sort();
  if (syms.length < 8) return {};
  const B = syms.map((s) => universe[s]);
  const AC = avgCorr(B, 0, p.corrWindow);
  const lagged = [];
  for (let j = 1; j <= p.medianLags; j++) lagged.push(avgCorr(B, 21 * j, p.corrWindow));
  const med = median(lagged);
  const out = {};
  if (AC <= med) {
    const mom = syms.map((s) => {
      const b = universe[s];
      const e = b.length - 1;
      return { s, v: b[e - 21].close / b[e - 252].close - 1 };
    });
    mom.sort((x, y) => y.v - x.v || (x.s < y.s ? -1 : 1));
    for (const x of mom.slice(0, p.top)) out[x.s] = 1 / p.top;
  } else {
    const vol = syms.map((s) => ({ s, v: sampleStd(retsAt(universe[s], 0, 126)) }));
    vol.sort((x, y) => x.v - y.v || (x.s < y.s ? -1 : 1));
    for (const x of vol.slice(0, p.top)) out[x.s] = 1 / p.top;
  }
  return out;
}
