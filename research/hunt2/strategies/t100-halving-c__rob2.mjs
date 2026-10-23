// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-halving-c__rob2",
  "name": "Bitcoin halving cycle: long every crypto for 18 months after each halving (2016-07-09, 2020-05-11, 2024-04-20) (crypto 1d x18) (+25%)",
  "family": "top100-1006",
  "source": "Halving-cycle content is a crypto-YouTube/Reddit staple (r/CryptoCurrency threads); 4-year-cycle charts",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "starts": [
      1468022400,
      1589155200,
      1713571200
    ],
    "days": 685
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const t = b.time;
  for (const st of P.starts) if (t >= st && t < st + P.days * 86400) return 1;
  return 0;
}
