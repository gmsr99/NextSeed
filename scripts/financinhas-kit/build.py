"""Gera o kit de arranque do Financinhas a partir dos PDFs originais.

Os originais (Caderninho_Financinhas.pdf, Etiquetas_Mealheiros.pdf,
Folha_Contas_Financinhas.pdf) vivem na pasta privada do Drive
(Financinhas › Materiais e protótipos), NÃO no repositório: são da família
do fundador. Este programa usa o próprio desenho original (convertido em
vetores) e só faz três coisas:
  1. troca o valor do chão da família ("€5") por um espaço para preencher;
  2. acrescenta o logótipo NexSeed no rodapé;
  3. imprime para PDF com o Chrome (o mesmo motor que gerou os originais).
As folhas novas (Mapa de Moedas, Fotografia inicial) saem de HTML com as
mesmas letras, cores e medidas.

Uso:  python3 build.py <pasta-com-originais> [pasta-saida]
      (por defeito, a saída é public/financinhas/kit; as letras estão em ./fonts)
Precisa de: pdftocairo, qpdf, google-chrome, python3 com fontTools.
"""
import os, re, subprocess, sys, shutil, tempfile
sys.path.insert(0, os.path.dirname(__file__))
from logo import logo

HERE0 = os.path.dirname(os.path.abspath(__file__))
ORIG = sys.argv[1]
FONTS = os.path.join(HERE0, "fonts")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE0, "..", "..", "public", "financinhas", "kit")
QUICKSAND = os.path.join(FONTS, "Quicksand[wght].ttf")
HERE = os.path.dirname(os.path.abspath(__file__))
TMP = tempfile.mkdtemp(prefix="kit-")
os.makedirs(OUT, exist_ok=True)

def run(*cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

USE = re.compile(r'<use xlink:href="#([^"]+)" x="([\d.\-]+)" y="([\d.\-]+)"/>')

def wrapper(s, pos):
    """Início e fim da cadeia de <g> que embrulha só este glifo."""
    start, end = pos, s.index("/>", pos) + 2
    while True:
        ps = s.rfind("<g", 0, start)
        if re.fullmatch(r"<g[^>]*>\s*", s[ps:start]) is None:
            break
        nxt = re.match(r"\s*</g>", s[end:])
        if not nxt:
            break
        start, end = ps, end + nxt.end()
    return start, end

def glyphs_on_line(s, y, x0, x1):
    return [(m, float(m.group(2))) for m in USE.finditer(s)
            if abs(float(m.group(3)) - y) < 0.01 and x0 <= float(m.group(2)) <= x1]

def blank_value(s, y, x_digit, line_end, width, color, center=False, line_start=None, sw=0.7):
    """Tira o glifo em x_digit (o "5"), desenha uma linha para escrever e
    empurra o resto da linha. Com center=True, a etiqueta fica centrada."""
    row = glyphs_on_line(s, y, (line_start or x_digit) - 0.01, line_end)
    digit = [g for g in row if abs(g[1] - x_digit) < 0.02]
    assert len(digit) == 1, f"glifo não encontrado em x={x_digit}"
    after = sorted([g for g in row if g[1] > x_digit + 0.02], key=lambda g: g[1])
    old_w = (after[0][1] - x_digit) if after else width * 0.33
    delta = width - old_w
    shift_before = -delta / 2 if center else 0.0
    edits = []  # (start, end, replacement)
    a, b = wrapper(s, digit[0][0].start())
    edits.append((a, b, ""))
    for m, x in after:
        a, b = wrapper(s, m.start())
        edits.append((a, b, f'<g transform="translate({delta + shift_before:.3f} 0)">{s[a:b]}</g>'))
    if center:
        for m, x in row:
            if x < x_digit - 0.02:
                a, b = wrapper(s, m.start())
                edits.append((a, b, f'<g transform="translate({shift_before:.3f} 0)">{s[a:b]}</g>'))
    lx = x_digit + 0.6 + shift_before
    line = (f'<line x1="{lx:.3f}" y1="{y + 1.4:.3f}" x2="{lx + width - 1.6:.3f}" y2="{y + 1.4:.3f}" '
            f'stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>')
    for a, b, rep in sorted(edits, key=lambda e: -e[0]):
        s = s[:a] + rep + s[b:]
    return s.replace("</svg>", line + "\n</svg>")

def add_logo(s, cy, uid):
    return s.replace("</svg>", logo(QUICKSAND, 297.48, cy, uid=uid) + "\n</svg>")

def page_svg(pdf, n, name):
    out = os.path.join(TMP, name + ".svg")
    run("pdftocairo", "-svg", "-f", str(n), "-l", str(n), os.path.join(ORIG, pdf), out)
    return out

INK, MUTE, ORANGE = "rgb(19.999695%, 17.248535%, 26.269531%)", "rgb(48.629761%, 45.489502%, 56.469727%)", "rgb(93.328857%, 48.239136%, 23.529053%)"
CAD, ETI, CONTAS = "Caderninho_Financinhas.pdf", "Etiquetas_Mealheiros.pdf", "Folha_Contas_Financinhas.pdf"

pages = {}
# Caderninho p1 · capa (sem alterações; logótipo por baixo do cartão)
s = open(page_svg(CAD, 1, "cad1")).read()
pages["capa"] = add_logo(s, 825.5, "lg1")
# p2 · as contas de hoje: "o chão está lá (€5 que não desço)"
s = open(page_svg(CAD, 2, "cad2")).read()
s = blank_value(s, 317.219837, 133.975938, 205, 16, INK)
pages["contas_hoje"] = add_logo(s, 802.6, "lg2")
# p3 · o meu sonho (sem alterações)
s = open(page_svg(CAD, 3, "cad3")).read()
pages["sonho"] = add_logo(s, 802.6, "lg3")
# p4 · a minha semana: "o chão do mealheiro de gastar está lá (€5)"
s = open(page_svg(CAD, 4, "cad4")).read()
s = blank_value(s, 722.18133, 232.49, 245, 16, INK)
pages["semana"] = add_logo(s, 802.6, "lg4")
# Etiquetas: faixa "O CHÃO · €5" → "O CHÃO · €___" (a de €0,50 fica: é a regra dos 7–8)
s = open(page_svg(ETI, 1, "eti")).read()
s = blank_value(s, 618.691171, 113.98, 125, 15, "#ffffff", center=True, line_start=55, sw=1.1)
pages["etiquetas"] = add_logo(s, 826.0, "lg5")
# Folha de contas: "A coluna laranja nunca desce abaixo de €5."
s = open(page_svg(CONTAS, 1, "contas")).read()
s = blank_value(s, 736.429976, 231.94, 282, 13, ORANGE)
pages["folha_contas"] = add_logo(s, 805.6, "lg6")

# Ícones dos mealheiros (para as folhas novas): o desenho das etiquetas só com
# o que é branco, sem fundos — assim não há bordos ao recortar.
def only_white(svg):
    WHITE = "rgb(100%, 100%, 100%)"
    svg = re.sub(r'(fill|stroke)="(rgb\([^)]*\))"', lambda m: m.group(0) if m.group(2) == WHITE else f'{m.group(1)}="none"', svg)
    return svg.replace('d="M 0.0078125 0 L 595.453125 0 L 595.453125 842.167969 L 0.0078125 842.167969 Z M 0.0078125 0 "', 'd=""')
with open(os.path.join(TMP, "icones.svg"), "w") as f:
    f.write(only_white(open(os.path.join(TMP, "eti.svg")).read()))

for k, v in pages.items():
    with open(os.path.join(TMP, k + ".final.svg"), "w") as f:
        f.write(v)

def print_pdf(html_path, out_pdf):
    run("google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu",
        "--disable-background-networking", "--no-pdf-header-footer",
        "--print-to-pdf=" + out_pdf, "file://" + html_path)

def svg_pdf(names, out_pdf):
    imgs = "".join(f'<img src="{k}.final.svg">' for k in names)
    html = os.path.join(TMP, os.path.basename(out_pdf) + ".html")
    with open(html, "w") as f:
        f.write('<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:0}'
                'html,body{margin:0}img{display:block;width:210mm;height:297mm;break-after:page}'
                'img:last-child{break-after:auto}</style>' + imgs)
    print_pdf(html, out_pdf)

def html_pdf(name, out_pdf):
    src = os.path.join(HERE, name)
    dst = os.path.join(TMP, name)
    shutil.copy(src, dst)
    for fn in os.listdir(FONTS):
        if fn.endswith(".woff"):
            shutil.copy(os.path.join(FONTS, fn), TMP)
    with open(dst) as f:
        h = f.read()
    h = h.replace("<!--LOGO-->", '<svg class="nx" viewBox="0 0 595 842" xmlns="http://www.w3.org/2000/svg">'
                  + logo(QUICKSAND, 297.48, 802.6, uid="lgh") + "</svg>")
    with open(dst, "w") as f:
        f.write(h)
    print_pdf(dst, out_pdf)

P = lambda n: os.path.join(OUT, n)
svg_pdf(["capa", "contas_hoje", "sonho", "semana", "semana", "semana"], P("caderninho.pdf"))
svg_pdf(["etiquetas"], P("etiquetas-mealheiros.pdf"))
svg_pdf(["folha_contas"], P("folha-de-contas.pdf"))
svg_pdf(["sonho"], P("folha-o-meu-sonho.pdf"))
svg_pdf(["semana"], P("pagina-da-semana.pdf"))
html_pdf("mapa_moedas.html", P("mapa-de-moedas.pdf"))
html_pdf("fotografia.html", P("fotografia-inicial.pdf"))
run("qpdf", "--empty", "--pages",
    P("etiquetas-mealheiros.pdf"), P("caderninho.pdf"), P("folha-de-contas.pdf"),
    P("mapa-de-moedas.pdf"), P("fotografia-inicial.pdf"), "--", P("kit-completo.pdf"))
print("Kit gerado em", OUT)
