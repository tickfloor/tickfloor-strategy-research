"""Draw the one chart: excess return vs BH-adjusted q for every strategy.

Run: python3 scripts/make_chart.py   (standard library only)
Writes docs/chart-light.svg and docs/chart-dark.svg from data/strategy-results.json.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rows = json.loads((ROOT / "data" / "strategy-results.json").read_text())

INDIGO, RED = "#25446B", "#B42E2C"
W, H = 900, 520
L, R, T, B = 80, 30, 70, 70
XMIN, XMAX = -2.0, 1.5  # excess return per year, as a fraction
YMAX = 1.05
GATE = 0.10

THEMES = {
    "light": dict(bg="#ffffff", fg="#1f2328", grid="#d0d7de", dot=INDIGO, hit=RED, edge="#ffffff"),
    "dark": dict(bg="#0d1117", fg="#e6edf3", grid="#30363d", dot="#6f93c4", hit="#e5736f", edge="#0d1117"),
}


def sx(v): return L + (v - XMIN) / (XMAX - XMIN) * (W - L - R)
def sy(v): return H - B - v / YMAX * (H - T - B)


def svg(name, c):
    n = len(rows)
    low = min(r["q"] for r in rows)
    sig = sum(1 for r in rows if r["p"] < 0.05)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif">',
           f'<title>Excess return against BH-adjusted q-value for {n} strategies. None is below q = {GATE}.</title>',
           f'<rect width="{W}" height="{H}" fill="{c["bg"]}"/>',
           f'<text x="{L}" y="30" font-size="18" font-weight="600" fill="{c["fg"]}">{n:,} strategies, 0 below the q &lt; {GATE:.2f} line</text>',
           f'<text x="{L}" y="52" font-size="13" fill="{c["fg"]}" opacity="0.8">Each dot is one strategy. Red dots cleared p &lt; 0.05 before correction ({sig}). Lowest q after correction: {low:.3f}.</text>']
    for t in range(0, 6):  # y grid 0..1 step .2
        v = t / 5
        out.append(f'<line x1="{L}" x2="{W-R}" y1="{sy(v):.1f}" y2="{sy(v):.1f}" stroke="{c["grid"]}"/>')
        out.append(f'<text x="{L-8}" y="{sy(v)+4:.1f}" font-size="12" text-anchor="end" fill="{c["fg"]}">{v:.1f}</text>')
    for v in (-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5):
        out.append(f'<line x1="{sx(v):.1f}" x2="{sx(v):.1f}" y1="{T}" y2="{H-B}" stroke="{c["grid"]}"/>')
        out.append(f'<text x="{sx(v):.1f}" y="{H-B+18}" font-size="12" text-anchor="middle" fill="{c["fg"]}">{v*100:+.0f}%</text>')
    # empty zone where a survivor would sit
    out.append(f'<rect x="{L}" y="{sy(GATE):.1f}" width="{W-L-R}" height="{sy(0)-sy(GATE):.1f}" fill="{c["hit"]}" opacity="0.10"/>')
    out.append(f'<line x1="{L}" x2="{W-R}" y1="{sy(GATE):.1f}" y2="{sy(GATE):.1f}" stroke="{c["hit"]}" stroke-width="2" stroke-dasharray="6 4"/>')
    out.append(f'<text x="{W-R-6}" y="{sy(GATE)-8:.1f}" font-size="12" text-anchor="end" fill="{c["hit"]}">q = {GATE:.2f} line. A surviving strategy would sit below it.</text>')
    for r in sorted(rows, key=lambda r: r["p"] < 0.05):  # red on top
        hit = r["p"] < 0.05
        out.append(f'<circle cx="{sx(r["excess"]):.1f}" cy="{sy(min(r["q"], 1)):.1f}" r="{3.6 if hit else 2.8}" fill="{c["hit"] if hit else c["dot"]}" fill-opacity="{0.9 if hit else 0.45}" stroke="{c["edge"]}" stroke-width="0.4"/>')
    out.append(f'<text x="{(L+W-R)/2}" y="{H-24}" font-size="13" text-anchor="middle" fill="{c["fg"]}">Excess return per year over buy-and-hold of the same assets (in-sample)</text>')
    out.append(f'<text transform="translate(20 {(T+H-B)/2}) rotate(-90)" font-size="13" text-anchor="middle" fill="{c["fg"]}">q-value (Benjamini-Hochberg adjusted)</text>')
    out.append('</svg>')
    (ROOT / "docs" / f"chart-{name}.svg").write_text("\n".join(out) + "\n")


for name, c in THEMES.items():
    svg(name, c)
print("wrote docs/chart-light.svg and docs/chart-dark.svg")
