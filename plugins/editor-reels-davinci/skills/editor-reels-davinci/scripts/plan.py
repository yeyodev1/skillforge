# Plantilla: genera graficos/src/data.ts, davinci/plan.json y la voz ya cortada (crudo/voz/voz_reel.wav).
# Cada corte se define por palabras (inicio de la primera y de la última) dentro de su clip y se ajusta con la energía
# real de la voz limpia: entra un respiro antes de la primera palabra y sale con la cola natural de la última.
# Uso (desde la carpeta del reel): python3 plan.py
# Necesita crudo/voz/lNNNN.wav (voz.sh) y crudo/wx/aNNNN.json (transcribir.sh).
import array, json, math, os, re, wave

FPS = 30
REEL = os.getcwd()
CRUDO = os.path.join(REEL, "crudo")

# (id, clip, inicio de la primera palabra, inicio de la última palabra) — poner el texto como comentario
CORTES = [
    ("hook", 1635, 3.23, 6.91),  # Ejemplo: frase del gancho
    # ("cta", 1645, 7.15, 8.34),  # comenta IDEA y estaremos hablando.
]
OUTRO = 0  # frames extra al final
# Ajustes a mano después de ver el corte: {id: (inicio o None, fin o None)} en segundos del clip
AJUSTES = {}
# Correcciones de la transcripción: {"palabra en minúscula": "Como Debe Ir"}
FIX = {}
# Palabras que marcan momentos para las gráficas: {nombre_cue: (id_corte, palabra, n-ésima aparición)}
CUE_WORDS = {
    # "w_idea": ("cta", "idea", 0),
}

def regions_of(clip):
    wv = wave.open(os.path.join(CRUDO, "voz", f"l{clip}.wav"))
    sr = wv.getframerate()
    pcm = array.array("h", wv.readframes(wv.getnframes()))
    hop = sr // 100
    speech = []
    for i in range(0, len(pcm) - hop, hop):
        seg = pcm[i : i + hop]
        e = math.sqrt(sum(v * v for v in seg) / hop) + 1e-9
        speech.append(20 * math.log10(e / 32768) > -42)
    regs, i = [], 0
    while i < len(speech):
        if speech[i]:
            j = i
            while j < len(speech) and speech[j]:
                j += 1
            if regs and i - regs[-1][1] <= 6:
                regs[-1][1] = j
            else:
                regs.append([i, j])
            i = j
        else:
            i += 1
    return sr, pcm, [(a / 100, b / 100) for a, b in regs]


def words_of(clip):
    d = json.load(open(os.path.join(CRUDO, "wx", f"a{clip}.json")))
    return [w for s in d["segments"] for w in s["words"] if "start" in w]


CLIPS = sorted({c for _, c, _, _ in CORTES})
AUD = {c: regions_of(c) for c in CLIPS}
WDS = {c: words_of(c) for c in CLIPS}


def refine(clip, ws, we):
    W = WDS[clip]
    REG = AUD[clip][2]
    wf = min(W, key=lambda w: abs(w["start"] - ws))
    wl = min(W, key=lambda w: abs(w["start"] - we))
    i0, i1 = W.index(wf), W.index(wl)
    prev_end = W[i0 - 1]["end"] if i0 > 0 else 0
    next_start = W[i1 + 1]["start"] if i1 + 1 < len(W) else wl["end"] + 1
    r0 = [r for r in REG if r[1] > wf["start"] - 0.05 and r[0] < wf["start"] + 0.15]
    rs = r0[0][0] if r0 else wf["start"]
    if rs < prev_end - 0.02 or rs < wf["start"] - 0.25:
        rs = max(wf["start"] - 0.03, prev_end + 0.01)
    gap_before = rs - max([r[1] for r in REG if r[1] <= rs + 0.001] or [0])
    start = rs - min(0.08, max(0.0, gap_before) * 0.5)
    r1 = [r for r in REG if r[0] <= wl["start"] + 0.05 and r[1] > wl["start"]]
    re_ = r1[-1][1] if r1 else wl["end"]
    if re_ > next_start + 0.02 or re_ > wl["end"] + 0.40:
        re_ = min(wl["end"] + 0.03, next_start - 0.01)
    nxt = [r[0] for r in REG if r[0] >= re_ - 0.001]
    gap_after = (nxt[0] if nxt else re_ + 1) - re_
    end = re_ + min(0.14, max(0.0, gap_after) * 0.5)
    start = max(start, prev_end + 0.01, 0)
    end = min(end, next_start - 0.02)
    return start, end


segs, words, cuts = [], [], []
t = 0
for sid, clip, a, b in CORTES:
    a, b = refine(clip, a, b)
    if sid in AJUSTES:
        a = AJUSTES[sid][0] if AJUSTES[sid][0] is not None else a
        b = AJUSTES[sid][1] if AJUSTES[sid][1] is not None else b
    f0 = round(a * FPS)
    dur = round(b * FPS) - f0
    a = f0 / FPS
    b = a + dur / FPS
    cuts.append((sid, clip, a, b))
    segs.append({"id": sid, "clip": clip, "from": t, "dur": dur, "kind": "talk", "in": a})
    for w in WDS[clip]:
        if a - 0.02 <= w["start"] < b:
            s = t + round((w["start"] - a) * FPS)
            e = t + round((min(w["end"], b) - a) * FPS)
            txt = w["word"].strip()
            key = txt.lower().strip(".,¿?")
            if key in FIX:
                txt = txt.replace(txt.strip(".,¿?"), FIX[key])
            words.append({"t": txt, "s": s, "e": max(e, s + 3), "seg": sid})
    t += dur

TOTAL = t + OUTRO

# ---------- Voz cortada en una sola pista (fundidos de 12 ms en cada borde) ----------
SR = AUD[CLIPS[0]][0]
voz = array.array("h", [0]) * int(TOTAL / FPS * SR + SR)
FADE = int(0.012 * SR)
for (sid, clip, a, b), s in zip(cuts, segs):
    pcm = AUD[clip][1]
    i0 = round(a * SR)
    n = round(s["dur"] / FPS * SR)
    o = round(s["from"] / FPS * SR)
    for k in range(n):
        g = min(1.0, k / FADE, (n - 1 - k) / FADE)
        if i0 + k < len(pcm):
            voz[o + k] = int(pcm[i0 + k] * g)
ww = wave.open(os.path.join(CRUDO, "voz", "voz_reel.wav"), "w")
ww.setnchannels(1)
ww.setsampwidth(2)
ww.setframerate(SR)
ww.writeframes(voz[: int(TOTAL / FPS * SR)].tobytes())
ww.close()


def norm(x):
    return re.sub(r"[^\wáéíóúñ]", "", x.lower())


def cue(seg, word, nth=0):
    hits = [w for w in words if w["seg"] == seg and norm(w["t"]) == norm(word)]
    return hits[nth]["s"]


C = {s["id"]: s["from"] for s in segs}
C.update({k: cue(*v) for k, v in CUE_WORDS.items()})

out = "// Generado por plan.py — no editar a mano.\n"
out += f"export const TOTAL = {TOTAL};\n"
out += f"export const SEGS = {json.dumps(segs)} as const;\n"
out += f"export const CUES = {json.dumps(C, indent=1)};\n"
out += f"export const WORDS: {{ t: string; s: number; e: number; seg: string }}[] = {json.dumps(words, ensure_ascii=False)};\n"
os.makedirs(os.path.join(REEL, "graficos", "src"), exist_ok=True)
open(os.path.join(REEL, "graficos", "src", "data.ts"), "w").write(out)
os.makedirs(os.path.join(REEL, "davinci"), exist_ok=True)
json.dump({"total": TOTAL, "segs": segs}, open(os.path.join(REEL, "davinci", "plan.json"), "w"), indent=1)
print("TOTAL", TOTAL, f"({TOTAL / FPS:.1f}s)")
for (sid, clip, a, b), s in zip(cuts, segs):
    txt = " ".join(w["t"] for w in words if w["seg"] == sid)
    print(f"  {sid:9s} {clip} {a:6.2f}-{b:6.2f} @{s['from']:4d}  {txt}")
