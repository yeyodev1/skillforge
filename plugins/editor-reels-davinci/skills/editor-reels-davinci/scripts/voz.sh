#!/bin/zsh
# Limpia la voz de un clip: DeepFilterNet + EQ/compresión de voz + −14 LUFS.
# Uso (desde la carpeta del reel): voz.sh NNNN   (lee crudo/cNNNN.mov, escribe crudo/voz/lNNNN.wav)
set -e
N="$1"
mkdir -p crudo/voz/df
ffmpeg -v error -y -i "crudo/c$N.mov" -vn -ac 1 -ar 48000 "crudo/voz/r$N.wav"
uvx --from deepfilternet deepFilter "crudo/voz/r$N.wav" -o crudo/voz/df >/dev/null 2>&1
ffmpeg -v error -y -i "crudo/voz/df/r${N}_DeepFilterNet3.wav" -af "highpass=f=85,equalizer=f=140:t=q:w=1:g=2.5,equalizer=f=320:t=q:w=1.2:g=-3,equalizer=f=3200:t=q:w=1.4:g=3.5,equalizer=f=9000:t=h:w=0.7:g=2,deesser=i=0.35,acompressor=threshold=-24dB:ratio=3.5:attack=8:release=120:makeup=6dB:knee=4,asoftclip=type=tan,loudnorm=I=-14:TP=-1.2:LRA=9" -ar 48000 "crudo/voz/l$N.wav"
echo "OK → crudo/voz/l$N.wav"
