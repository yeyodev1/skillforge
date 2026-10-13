#!/bin/zsh
# Transcribe en local con WhisperX (palabras con tiempos). El audio no sale de la máquina.
# Uso (desde la carpeta del reel): transcribir.sh NNNN [NNNN ...]  → crudo/aNNNN.wav y crudo/wx/aNNNN.json
# WHISPERX: binario de whisperx (por defecto el que instala el plugin "watch", si no `whisperx` del PATH).
set -e
WX="${WHISPERX:-$HOME/.cache/watch/whisperx-venv/bin/whisperx}"
[ -x "$WX" ] || WX=whisperx
mkdir -p crudo/wx
for N in "$@"; do
  ffmpeg -v error -y -i "crudo/c$N.mov" -vn -ac 1 -ar 16000 "crudo/a$N.wav"
  "$WX" "crudo/a$N.wav" --model large-v3-turbo --language es --compute_type int8 --device cpu --output_format json --output_dir crudo/wx 2>&1 | tail -1
done
