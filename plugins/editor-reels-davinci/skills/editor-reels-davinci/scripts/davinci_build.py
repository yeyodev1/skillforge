# Arma en DaVinci Resolve el timeline del reel a partir de davinci/plan.json (generado por plan.py).
# Pistas: V1 video (clips originales cortados), V2 gráficas detrás, V3 persona (máscara), V4 gráficas delante, V5 grano, V6 leaks;
# A1 voz limpia, A2 SFX, A3 música.
# Uso: correr con el MCP de DaVinci (run_script) o con el Python de Resolve, pasando:  <carpeta_del_reel> <Nombre> <vN> [cue_leak ...]
# Espera: crudo/cNNNN.mov, crudo/persona/pNNNN.mov, davinci/clips/voz_reel_vN.wav, davinci/{Detras,Delante}_vN.mov,
#         davinci/{Sonido,Musica}_vN.wav, davinci/fx/{grain,leak_warm,leak_pink}.mp4
import json, os, sys

R = sys.argv[1]
NOMBRE = sys.argv[2]
V = sys.argv[3] if len(sys.argv) > 3 else "v1"
LEAK_CUES = sys.argv[4:]  # ids de cortes donde entra un leak (8 frames antes)
D = R + "/davinci"
if "resolve" not in globals():
    import DaVinciResolveScript as dvr
    resolve = dvr.scriptapp("Resolve")

plan = json.load(open(D + "/plan.json", encoding="utf-8"))
TOTAL = plan["total"]
clips = sorted({s["clip"] for s in plan["segs"]})
pm = resolve.GetProjectManager()
p = pm.GetCurrentProject()
if p is None or p.GetName() != NOMBRE:
    p = pm.LoadProject(NOMBRE) or pm.CreateProject(NOMBRE)
p.SetSetting("timelineResolutionWidth", "1080")
p.SetSetting("timelineResolutionHeight", "1920")
p.SetSetting("timelineFrameRate", "30")
mp = p.GetMediaPool()
root = mp.GetRootFolder()

fx = [f"{D}/fx/{n}" for n in ("grain.mp4", "leak_warm.mp4", "leak_pink.mp4") if os.path.exists(f"{D}/fx/{n}")]
files = {
    "clips": [f"{R}/crudo/c{c}.mov" for c in clips] + [f"{R}/crudo/persona/p{c}.mov" for c in clips] + [f"{D}/clips/voz_reel_{V}.wav"],
    "graficas": [f"{D}/Detras_{V}.mov", f"{D}/Delante_{V}.mov", f"{D}/Sonido_{V}.wav", f"{D}/Musica_{V}.wav"],
    "fx": fx,
}
bins = {f.GetName(): f for f in root.GetSubFolderList()}
items = {}
for b, paths in files.items():
    if b not in bins:
        bins[b] = mp.AddSubFolder(root, b)
    have = {c.GetClipProperty("File Path") for c in bins[b].GetClipList()}
    new = [x for x in paths if x not in have and os.path.exists(x)]
    if new:
        mp.SetCurrentFolder(bins[b])
        mp.ImportMedia(new)
    for c in bins[b].GetClipList():
        items[os.path.basename(c.GetClipProperty("File Path"))] = c

name = f"{NOMBRE} {V}"
existing = {p.GetTimelineByIndex(i + 1).GetName() for i in range(p.GetTimelineCount())}
k = 1
while name in existing:
    k += 1
    name = f"{NOMBRE} {V}.{k}"
mp.SetCurrentFolder(root)
tl = mp.CreateEmptyTimeline(name)
p.SetCurrentTimeline(tl)
for _ in range(5):
    tl.AddTrack("video")
tl.AddTrack("audio", "stereo")
tl.AddTrack("audio", "stereo")
for i, v in enumerate(["Video", "Graficas detras", "Persona (mascara)", "Graficas delante", "Grano", "Leaks"], 1):
    tl.SetTrackName("video", i, v)
for i, a in enumerate(["Voz", "SFX", "Musica"], 1):
    tl.SetTrackName("audio", i, a)
st = tl.GetStartFrame()
log = []


def place(infos):
    if infos[0]["mediaPoolItem"] is None:
        log.append(f"FALTA archivo pista {infos[0].get('trackIndex')}")
        return []
    out = mp.AppendToTimeline(infos) or []
    if not out:
        log.append(f"FALLO pista {infos[0].get('trackIndex')} @{infos[0].get('recordFrame')}")
    return out


for i, s in enumerate(plan["segs"]):
    rec = st + s["from"]
    n = s["dur"]
    a = round(s["in"] * 30)
    z = 1.0 if i % 2 == 0 else 1.18
    v = place([{"mediaPoolItem": items.get(f"c{s['clip']}.mov"), "startFrame": a, "endFrame": a + n, "trackIndex": 1, "recordFrame": rec, "mediaType": 1}])
    pr = place([{"mediaPoolItem": items.get(f"p{s['clip']}.mov"), "startFrame": a, "endFrame": a + n, "trackIndex": 3, "recordFrame": rec, "mediaType": 1}])
    for it in v + pr:
        # zoom alterno con el origen a la altura de la cara (40% desde arriba), igual en video y máscara
        it.SetProperty("ZoomX", z)
        it.SetProperty("ZoomY", z)
        it.SetProperty("Tilt", -(960 - 0.40 * 1920) * (z - 1))

for f, track, kind in [(f"voz_reel_{V}.wav", 1, 2), (f"Detras_{V}.mov", 2, 1), (f"Delante_{V}.mov", 4, 1), (f"Sonido_{V}.wav", 2, 2), (f"Musica_{V}.wav", 3, 2)]:
    place([{"mediaPoolItem": items.get(f), "startFrame": 0, "endFrame": TOTAL, "trackIndex": track, "recordFrame": st, "mediaType": kind}])

gr = items.get("grain.mp4")
if gr:
    gfr = int(gr.GetClipProperty("Frames"))
    pos = 0
    while pos < TOTAL:
        n = min(gfr, TOTAL - pos)
        for x in place([{"mediaPoolItem": gr, "startFrame": 0, "endFrame": n, "trackIndex": 5, "recordFrame": st + pos, "mediaType": 1}]):
            x.SetProperty("CompositeMode", resolve.COMPOSITE_OVERLAY)
            x.SetProperty("Opacity", 20.0)
        pos += n

cues = {s["id"]: s["from"] for s in plan["segs"]}
for j, cid in enumerate(LEAK_CUES):
    f = "leak_warm.mp4" if j % 2 == 0 else "leak_pink.mp4"
    if cid in cues and f in items:
        for x in place([{"mediaPoolItem": items[f], "startFrame": 0, "endFrame": 24, "trackIndex": 6, "recordFrame": st + max(0, cues[cid] - 8), "mediaType": 1}]):
            x.SetProperty("CompositeMode", resolve.COMPOSITE_SCREEN)
            x.SetProperty("Opacity", 65.0)

pm.SaveProject()
print(f"{name}: listo. " + ("; ".join(log) if log else "sin fallos"))
