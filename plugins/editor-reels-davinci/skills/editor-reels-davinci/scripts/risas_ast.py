# Detector de risas con AST (AudioSet): probabilidad de "Laughter" por ventana de 2 s cada 0.5 s
# Uso (desde la carpeta del reel): uv run --with transformers --with torch --with numpy python risas_ast.py [ini-fin ...]  (lee crudo/audio16k.wav, escribe crudo/risas_ast.json)
import json, wave, numpy as np, torch
from transformers import ASTFeatureExtractor, ASTForAudioClassification
M = "MIT/ast-finetuned-audioset-10-10-0.4593"
fe = ASTFeatureExtractor.from_pretrained(M)
model = ASTForAudioClassification.from_pretrained(M).eval()
dev = "mps" if torch.backends.mps.is_available() else "cpu"
model.to(dev)
lab = model.config.label2id
ids = [lab[k] for k in ["Laughter", "Giggle", "Chuckle, chortle", "Belly laugh", "Snicker", "Baby laughter"] if k in lab]
W = wave.open("crudo/audio16k.wav"); sr = W.getframerate()
a = np.frombuffer(W.readframes(W.getnframes()), dtype=np.int16).astype(np.float32) / 32768
win, hop = 2 * sr, sr // 2
import sys
# Solo alrededor de los clips (zonas "ini-fin" en segundos) para que sea rápido
zonas = [tuple(map(float, z.split("-"))) for z in sys.argv[1:]] or [(0, len(a) / sr)]
starts = sorted({s for z0, z1 in zonas for s in range(int(max(0, z0 - 1) * sr), int((z1 - 1) * sr), hop)})
out = []
B = 32
for k in range(0, len(starts), B):
    chunk = [a[s:s + win] for s in starts[k:k + B]]
    x = fe(chunk, sampling_rate=sr, return_tensors="pt")["input_values"].to(dev)
    with torch.no_grad():
        p = torch.sigmoid(model(x).logits)[:, ids].max(1).values.cpu().numpy()
    for s, v in zip(starts[k:k + B], p):
        out.append([round(s / sr + 1, 2), round(float(v), 3)])
    if k % (B * 5) == 0:
        print(k, "/", len(starts), flush=True)
json.dump(out, open("crudo/risas_ast.json", "w"))
print("listo", len(out))
