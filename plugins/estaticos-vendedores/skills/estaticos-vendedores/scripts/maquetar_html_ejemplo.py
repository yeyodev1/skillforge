"""EJEMPLO (Bruval). Copiar a la carpeta de trabajo del cliente, ajustar SRC/OUT, colores, textos y fotos. Genera 9 estáticos Bruval (3 conceptos x 3 formatos) en HTML y los exporta a PNG con Chrome headless."""
import subprocess, pathlib

BASE = pathlib.Path(__file__).parent
SRC = BASE / "src"
OUT = BASE.parent  # ~/Documents/BRUVAL
HTML = BASE / "html"
HTML.mkdir(exist_ok=True)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

NAVY = "#142f4d"
FORMATS = {"1x1": (1080, 1080), "4x5": (1080, 1350), "9x16": (1080, 1920)}

F = (SRC/"fonts").as_uri()
CSS = f"""
@font-face{{font-family:'Julius Sans One';src:url('{F}/julius-400.ttf')}}
@font-face{{font-family:'Open Sans';font-weight:400;src:url('{F}/opensans-400.ttf')}}
@font-face{{font-family:'Open Sans';font-weight:600;src:url('{F}/opensans-600.ttf')}}
@font-face{{font-family:'Open Sans';font-weight:700;src:url('{F}/opensans-700.ttf')}}
@font-face{{font-family:'Open Sans';font-weight:800;src:url('{F}/opensans-800.ttf')}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:var(--w);height:var(--h);overflow:hidden;font-family:'Open Sans',sans-serif;color:{NAVY};
 background:radial-gradient(ellipse at 70% 60%,#ffffff 0%,#f6f3ee 45%,#ebe5dc 100%);position:relative}}
.logo{{position:absolute;height:54px}}
.eyebrow{{font-family:'Julius Sans One';font-size:30px;letter-spacing:.18em;color:#8a6a4f}}
h1{{font-family:'Open Sans';font-weight:800;line-height:1.02;letter-spacing:-.025em;color:{NAVY}}}
h1 em{{font-style:normal;color:#c2416b}}
.sub{{font-size:34px;line-height:1.3;color:#3d4f63}}
.cta{{display:inline-block;background:{NAVY};color:#fff;font-weight:700;font-size:34px;letter-spacing:.06em;
 padding:30px 56px;border-radius:999px;box-shadow:0 14px 30px rgba(20,47,77,.25)}}
.pill{{display:inline-block;border:2px solid {NAVY};color:{NAVY};font-weight:700;font-size:26px;letter-spacing:.08em;padding:12px 26px;border-radius:999px}}
.prod{{position:absolute;filter:drop-shadow(0 30px 30px rgba(60,40,20,.22))}}
.shadow{{position:absolute;background:radial-gradient(ellipse,rgba(70,50,30,.28),transparent 70%)}}
.old{{text-decoration:line-through;color:#8b96a3;font-weight:600}}
.price{{font-weight:800;color:#c2416b}}
.fine{{position:absolute;font-size:20px;color:#7b8794}}
.card{{position:absolute;text-align:center}}
.card .tag{{font-family:'Julius Sans One';font-size:26px;letter-spacing:.08em;color:#8a6a4f}}
.card .p{{font-weight:800;font-size:46px;color:{NAVY}}}

.pw{{position:absolute}}
.pw img{{display:block;margin:0 auto;filter:drop-shadow(0 24px 22px rgba(60,40,20,.20))}}
.pw .fl{{position:absolute;left:12%;right:12%;bottom:-18px;height:36px;background:radial-gradient(ellipse,rgba(70,50,30,.30),transparent 70%);z-index:-1}}
"""

def page(w, h, body):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>:root{{--w:{w}px;--h:{h}px}}{CSS}</style></head>
<body>{body}</body></html>"""

LOGO = (SRC / "bruval.png").as_uri()

def prod(name, cx, bottom, height, maxw=1000):
    """Producto recortado, centrado en x=cx, con la base en y=bottom (px desde arriba)."""
    return (f'<div class="pw" style="left:{cx}px;transform:translateX(-50%);top:{bottom-height}px;height:{height}px">'
            f'<img src="{(SRC/name).as_uri()}" style="height:{height}px;max-width:{maxw}px;object-fit:contain;object-position:bottom"><div class="fl"></div></div>')

def logo(x=None, top=70, h=58):
    pos = f"left:{x}px" if x is not None else "left:50%;transform:translateX(-50%)"
    return f'<img class="logo" src="{LOGO}" style="{pos};top:{top}px;height:{h}px">'

def cta(text, top=None, bottom=None, left=None, size=34):
    v = f"top:{top}px" if top is not None else f"bottom:{bottom}px"
    if left is None:
        return f'<div style="position:absolute;{v};width:100%;text-align:center"><span class="cta" style="font-size:{size}px">{text}</span></div>'
    return f'<div style="position:absolute;{v};left:{left}px"><span class="cta" style="font-size:{size}px">{text}</span></div>'

# ---------- Concepto 1: oferta ----------
def oferta(fmt):
    w, h = FORMATS[fmt]
    H1 = 'Su detalle favorito, <em>$30&nbsp;menos</em>'
    if fmt == "1x1":
        return page(w, h, f"""
{logo(80,70)}
<div style="position:absolute;left:80px;top:220px;width:560px">
 <div class="eyebrow" style="font-size:26px">OFERTA POR TIEMPO LIMITADO</div>
 <h1 style="font-size:88px;margin-top:22px">{H1}</h1>
 <div style="margin-top:30px;font-size:52px"><span class="old">$119</span>&nbsp; <span class="price" style="font-size:104px">$89</span></div>
 <div class="pill" style="margin-top:18px">ENVÍO GRATIS</div>
</div>
{cta('COMPRA EL TUYO', bottom=90, left=80)}
{prod('006-c.png', 820, 990, 780)}
<div class="fine" style="left:80px;bottom:44px">Precios + IVA · Envío gratis por tiempo limitado</div>""")
    if fmt == "4x5":
        return page(w, h, f"""
{logo(top=70)}
<div style="position:absolute;top:170px;width:100%;text-align:center">
 <div class="eyebrow">OFERTA POR TIEMPO LIMITADO</div>
 <h1 style="font-size:96px;margin:18px auto 0;width:960px">{H1}</h1>
</div>
<div style="position:absolute;left:80px;top:640px">
 <div style="font-size:50px"><span class="old">$119</span></div>
 <div class="price" style="font-size:150px;line-height:1">$89</div>
 <div class="pill" style="margin-top:22px">ENVÍO GRATIS</div>
</div>
{prod('006-c.png', 720, 1140, 720)}
{cta('COMPRA EL TUYO', bottom=80)}
<div class="fine" style="width:100%;text-align:center;bottom:34px">Precios + IVA · Envío gratis por tiempo limitado</div>""")
    return page(w, h, f"""
{logo(top=300)}
<div style="position:absolute;top:400px;width:100%;text-align:center">
 <div class="eyebrow">OFERTA POR TIEMPO LIMITADO</div>
 <h1 style="font-size:104px;margin:18px auto 0;width:960px">{H1}</h1>
</div>
<div style="position:absolute;left:80px;top:900px">
 <div style="font-size:54px"><span class="old">$119</span></div>
 <div class="price" style="font-size:160px;line-height:1">$89</div>
 <div class="pill" style="margin-top:22px">ENVÍO GRATIS</div>
</div>
{prod('006-c.png', 730, 1380, 600)}
{cta('COMPRA EL TUYO', top=1420)}""")

# ---------- Concepto 2: emocional ----------
def emocional(fmt):
    w, h = FORMATS[fmt]
    H1 = 'El desinterés no enamora. <em>Las flores sí.</em>'
    SUB = 'Un ramo dice lo que a veces no sabes cómo decir.'
    if fmt == "1x1":
        return page(w, h, f"""
{logo(80,70)}
<div style="position:absolute;left:80px;top:220px;width:600px">
 <h1 style="font-size:86px">{H1}</h1>
 <div class="sub" style="margin-top:30px;width:470px">{SUB}</div>
</div>
{cta('ELIGE SU RAMO', bottom=90, left=80)}
{prod('001-c.png', 830, 980, 700)}
<div class="fine" style="left:80px;bottom:44px">Arreglos desde $39 + IVA · bruval.com.ec</div>""")
    if fmt == "4x5":
        return page(w, h, f"""
{logo(80,70)}
<h1 style="position:absolute;left:80px;top:180px;width:940px;font-size:104px">{H1}</h1>
<div class="sub" style="position:absolute;left:80px;top:720px;width:380px">{SUB}</div>
{prod('001-c.png', 730, 1140, 620)}
{cta('ELIGE SU RAMO', bottom=80)}
<div class="fine" style="width:100%;text-align:center;bottom:34px">Arreglos desde $39 + IVA · bruval.com.ec</div>""")
    return page(w, h, f"""
{logo(top=300)}
<h1 style="position:absolute;top:400px;width:100%;text-align:center;font-size:110px;padding:0 70px">{H1}</h1>
{prod('001-c.png', 540, 1370, 590)}
{cta('ELIGE SU RAMO', top=1420)}""")

# ---------- Concepto 3: guía por ocasión ----------
TRIO = [("013-ok-c.png", "PRIMERA CITA", "$39", 0.72), ("015-c.png", "CUMPLEAÑOS", "$69", 0.80), ("012-c.png", "ANIVERSARIO", "$89", 1.0)]

def trio(base, maxh, xs):
    out = []
    for (f, tag, p, k), cx in zip(TRIO, xs):
        out.append(prod(f, cx, base, int(maxh * k), maxw=310))
        out.append(f'<div class="card" style="left:{cx-170}px;width:340px;top:{base+40}px"><div class="tag">{tag}</div><div class="p">{p}</div></div>')
    return "\n".join(out)

def guia(fmt):
    w, h = FORMATS[fmt]
    H1 = '¿Qué le regalas? <em>Elige por ocasión</em>'
    xs = [190, 540, 890]
    if fmt == "1x1":
        return page(w, h, f"""
{logo(top=55,h=50)}
<h1 style="position:absolute;top:135px;width:100%;text-align:center;font-size:74px">{H1}</h1>
{trio(760, 470, xs)}
{cta('ENCUENTRA EL IDEAL', bottom=50, size=30)}""")
    if fmt == "4x5":
        return page(w, h, f"""
{logo(top=70)}
<h1 style="position:absolute;top:170px;width:100%;text-align:center;font-size:92px;padding:0 80px">{H1}</h1>
{trio(960, 520, xs)}
{cta('ENCUENTRA EL IDEAL', bottom=80)}
<div class="fine" style="width:100%;text-align:center;bottom:34px">Precios + IVA · bruval.com.ec</div>""")
    return page(w, h, f"""
{logo(top=300)}
<h1 style="position:absolute;top:400px;width:100%;text-align:center;font-size:104px;padding:0 80px">{H1}</h1>
{trio(1220, 560, xs)}
{cta('ENCUENTRA EL IDEAL', top=1420)}""")

CONCEPTS = {"1-oferta": oferta, "2-emocional": emocional, "3-guia-ocasion": guia}

for cname, fn in CONCEPTS.items():
    for fmt, (w, h) in FORMATS.items():
        f = HTML / f"{cname}-{fmt}.html"
        f.write_text(fn(fmt), encoding="utf-8")
        png = OUT / f"bruval-{cname}-{fmt}.png"
        for _ in range(4):
          r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                        f"--window-size={w},{h}", "--virtual-time-budget=6000", "--allow-file-access-from-files",
                        f"--screenshot={png}", f.as_uri()], capture_output=True)
          if r.returncode == 0: break
        print("ok", png.name)
