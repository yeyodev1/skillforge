#!/bin/zsh
# Pista de música para DaVinci: al compás, con ducking bajo la voz, fade in/out y un corte en seco opcional para énfasis.
# Uso (desde la carpeta del reel):
#   mezcla.sh <cancion.mp3> <beat_s> <cue_beat> <salida.wav> [cue_corte cue_regreso] [cue_apagada]
#   beat_s      tiempo fuerte de la canción (beats.py) que debe caer en el cue <cue_beat>
#   cue_beat    nombre del cue de graficos/src/data.ts (ej. w_idea) donde cae ese tiempo fuerte
#   cue_corte / cue_regreso  la música se calla entre esos dos cues (silencio antes de la frase clave)
#   cue_apagada desde ahí la música suena "apagada" (lowpass), útil para una toma descartada al final
# Anotar arriba de la llamada: título, id de Pixabay, BPM.
set -e
M="$1"; BEAT="$2"; CB="$3"; OUT="$4"; CSTOP="${5:-}"; CGO="${6:-}"; CMUFF="${7:-}"
eval "$(python3 - "$BEAT" "$CB" "$CSTOP" "$CGO" "$CMUFF" <<'PY'
import re, sys
beat, cb, cs, cg, cm = sys.argv[1:]
src = open("graficos/src/data.ts").read()
tot = int(re.search(r"TOTAL = (\d+)", src).group(1))
c = {k: int(v) / 30 for k, v in re.findall(r'"(\w+)": (\d+)', src.split("CUES")[1].split("WORDS")[0])}
D = tot / 30
print(f"OFF={float(beat) - c[cb]:.3f} D={D:.3f}")
print(f"STOP={c[cs] - 0.06:.3f} GO={c[cg] - 0.02:.3f}" if cs else "STOP=-1 GO=-1")
print(f"MUFF={c[cm] - 0.1:.3f}" if cm else f"MUFF={D + 1:.3f}")
PY
)"
echo "música desde $OFF s · total $D s"
VOL="if(lt(t,0.25),t/0.25,1) * if(between(t,$STOP,$GO),0,1)"
ffmpeg -v error -y -i crudo/voz/voz_reel.wav -ss $OFF -t $D -i "$M" -filter_complex "
[1:a]aresample=48000,asplit=2[a][b];
[a]volume='if(lt(t,$MUFF),1,0)':eval=frame[full];
[b]lowpass=f=500,lowpass=f=500,volume='if(lt(t,$MUFF),0,1.3)':eval=frame[muff];
[full][muff]amix=inputs=2:normalize=0,volume='$VOL':eval=frame,volume=0.55,afade=t=out:st=$(echo "$D - 0.6" | bc):d=0.6[bed];
[0:a]aresample=48000[key];
[bed][key]sidechaincompress=threshold=0.04:ratio=4:attack=15:release=300:makeup=1[m]
" -map "[m]" -ac 2 "$OUT"
echo "OK → $OUT"
