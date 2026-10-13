#!/bin/zsh
# Sube un reel aprobado a Drive: <remoto>:<Mes Año>/<AAAA-MM-DD> - <nombre>.mp4
# Uso: subir_drive.sh "ruta/al/video.mp4" "Nombre del reel" [AAAA-MM-DD]
# DRIVE_REMOTE: remoto de rclone que apunta a la carpeta de contenido (por defecto "gdrive").
# Nunca usar `rclone link`: deja el archivo público.
set -e
VIDEO="$1"; NOMBRE="$2"; FECHA="${3:-$(stat -f %SB -t %Y-%m-%d "$VIDEO")}"
REMOTE="${DRIVE_REMOTE:-gdrive}"
[ -f "$VIDEO" ] || { echo "No existe: $VIDEO"; exit 1; }
[ -n "$NOMBRE" ] || { echo "Falta el nombre del reel"; exit 1; }
MESES=(Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre)
MES="${MESES[$((10#${FECHA:5:2}))]} ${FECHA:0:4}"
DESTINO="$REMOTE:$MES/$FECHA - $NOMBRE.${VIDEO##*.}"
rclone copyto "$VIDEO" "$DESTINO" --progress --drive-chunk-size 64M
echo "Subido → $MES/$FECHA - $NOMBRE.${VIDEO##*.}"
