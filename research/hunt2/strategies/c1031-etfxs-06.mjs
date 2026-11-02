// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-06). Stivers & Sun style dispersion gate on sector momentum.
// Harness rejects meta with both assets and universe, so the spec's universe 'ETFS_DAILY' is implied by assets.
export const meta = {
  id: "c1031-etfxs-06",
  name: "Dispersion-gated sector momentum: momentum only in low-dispersion months, equal-weight otherwise (Stivers-Sun)",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  longShort: false,
  params: { dispWindow: 21, medianLags: 12, top: 3 },
};

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

function sampleStd(a) {
  const m = mean(a);
  let s = 0;
  for (const x of a) s += (x - m) * (x - m);
  return Math.sqrt(s / (a.length - 1));
}

// Cross-sectional std of the dispWindow-day return, measured at offset `off` bars before the last bar.
function disp(B, off, w) {
  return sampleStd(B.map((b) => {
    const e = b.length - 1 - off;
    return b[e].close / b[e - w].close - 1;
  }));
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > 275).sort();
  if (syms.length < 8) return {};
  const B = syms.map((s) => universe[s]);
  const D = disp(B, 0, p.dispWindow);
  const lagged = [];
  for (let j = 1; j <= p.medianLags; j++) lagged.push(disp(B, p.dispWindow * j, p.dispWindow));
  const med = median(lagged);
  const out = {};
  if (D < med) {
    const mom = syms.map((s) => {
      const b = universe[s];
      const e = b.length - 1;
      return { s, v: b[e - p.dispWindow].close / b[e - 252].close - 1 };
    });
    mom.sort((x, y) => y.v - x.v || (x.s < y.s ? -1 : 1));
    for (const x of mom.slice(0, p.top)) out[x.s] = 1 / p.top;
  } else {
    for (const s of syms) out[s] = 1 / syms.length;
  }
  return out;
}
