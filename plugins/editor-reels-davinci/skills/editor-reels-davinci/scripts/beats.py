# BPM y tiempos fuertes de una canción, para sincronizar cortes y momentos clave al compás.
# Uso: uv run --with librosa python beats.py davinci/musica/cancion.mp3
import sys
import librosa

y, sr = librosa.load(sys.argv[1], sr=None, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
bpm = float(tempo[0] if hasattr(tempo, "__len__") else tempo)
print(f"BPM {bpm:.1f}")
print("tiempos (s):", " ".join(f"{b:.3f}" for b in beats[:64]))
print("compases (cada 4):", " ".join(f"{b:.3f}" for b in beats[::4][:16]))
