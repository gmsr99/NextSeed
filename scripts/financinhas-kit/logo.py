"""Logótipo NexSeed em SVG puro (sem fontes externas): círculo com o degradê
"warmth", rebento (ícone Sprout do Lucide, ISC) e a palavra NexSeed em
Quicksand Bold convertida em contornos. Cores de src/index.css."""
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

NEX = "#2D4A2D"      # "Nex" (como no NexSeedLogo em fundo claro)
SEED = "#E9C763"     # hsl(45 75% 65%) — --sidebar-primary
G1, G2 = "#E7C255", "#DFA049"  # --gradient-warmth: hsl(45 75% 62%) → hsl(35 70% 58%)

SPROUT = [
    "M7 20h10",
    "M10 20c5.5-2.5.8-6.4 3-10",
    "M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z",
    "M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z",
]

_font = None
def font(path):
    global _font
    if _font is None:
        _font = instantiateVariableFont(TTFont(path), {"wght": 700})
    return _font

def text_path(f, text, size, x, y):
    """Contornos do texto; devolve (d, largura)."""
    upm = f["head"].unitsPerEm
    cmap = f.getBestCmap(); gs = f.getGlyphSet(); hmtx = f["hmtx"]
    s = size / upm; ds = []; cx = 0.0
    for ch in text:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x + cx, y)))
        ds.append(pen.getCommands())
        cx += hmtx[g][0] * s
    return " ".join(ds), cx

def logo(font_path, cx, cy, h=11.0, uid="nxs"):
    """Logótipo centrado em (cx, cy); h = diâmetro do círculo, em pt."""
    f = font(font_path)
    size = h * 0.82
    gap = h * 0.28
    _, w_nex = text_path(f, "Nex", size, 0, 0)
    _, w_seed = text_path(f, "Seed", size, 0, 0)
    total = h + gap + w_nex + w_seed
    x0 = cx - total / 2
    r = h / 2
    base = cy + size * 0.35
    d_nex, _ = text_path(f, "Nex", size, x0 + h + gap, base)
    d_seed, _ = text_path(f, "Seed", size, x0 + h + gap + w_nex, base)
    k = h * 0.56 / 24  # ícone a 56% do círculo, como no componente (h-5 em h-9)
    ix, iy = x0 + r - 12 * k, cy - 12 * k
    icon = "".join(f'<path d="{p}"/>' for p in SPROUT)
    return (
        f'<g id="{uid}">'
        f'<defs><linearGradient id="{uid}-g" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{G1}"/><stop offset="1" stop-color="{G2}"/></linearGradient></defs>'
        f'<circle cx="{x0 + r:.3f}" cy="{cy:.3f}" r="{r:.3f}" fill="url(#{uid}-g)"/>'
        f'<g transform="translate({ix:.3f} {iy:.3f}) scale({k:.5f})" fill="none" stroke="#fff" '
        f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{icon}</g>'
        f'<path d="{d_nex}" fill="{NEX}"/><path d="{d_seed}" fill="{SEED}"/>'
        f'</g>'
    )
