# 🎞️ editor-reels-davinci

**El flujo con el que editamos los reels en Bakano.** DaVinci Resolve hace la edición (cortes, zooms, audio, acabado) y Remotion solo dibuja las gráficas, como capas transparentes que van detrás y delante de la persona. Claude arma todo por script y tú lo terminas o retocas en DaVinci.

> 🔒 La transcripción, la limpieza de voz y el recorte de persona corren en tu Mac. El video no se sube a ningún servidor.

## 📦 Instalación

```
/plugin marketplace add yeyodev1/skillforge
/plugin install editor-reels-davinci@skillforge
```

O descarga el [ZIP desde Releases](https://github.com/yeyodev1/skillforge/releases) y descomprímelo en `~/.claude/skills/`.

## 🧰 Qué necesitas (Mac)

| Herramienta | Para qué | Instalación |
|---|---|---|
| DaVinci Resolve Studio + su MCP | armar y renderizar el timeline | conectar el MCP de DaVinci Resolve en Claude Code |
| FFmpeg | audio y cortes | `brew install ffmpeg` |
| uv | DeepFilterNet, librosa | `brew install uv` |
| WhisperX | transcripción local | plugin `watch` o `uv tool install whisperx` |
| Node.js | Remotion | `brew install node` |
| Xcode CLT | recorte de persona (Apple Vision) | `xcode-select --install` |
| rclone (opcional) | subir a Drive | `brew install rclone` |

## 🗣️ Cómo activarlo

- *"Edítame este reel"* (y le pasas la carpeta con los clips)
- *"Hazle las gráficas"*
- *"Ponle música"* / *"¿De dónde saco la música?"*
- *"Pásalo a DaVinci y renderiza"*
- *"Súbelo al Drive"*

## 🎵 ¿De dónde sale la música?

De [**Pixabay Music**](https://pixabay.com/music/): es gratis, se puede usar en contenido comercial y no pide crédito. Claude busca por estilo, te baja 3 opciones para que elijas, la sincroniza al ritmo y baja el volumen sola cuando hablas.

## 🧭 Cómo trabaja

1. Transcribe los clips con WhisperX y limpia la voz con DeepFilterNet.
2. Corta por palabras (`plan.py`) y conserva risas y gestos clave.
3. Recorta a la persona con Apple Vision para que las gráficas vayan detrás.
4. Hace las gráficas en Remotion con logos reales, sin tapar nunca la cara.
5. Música de Pixabay al compás + SFX + grano y leaks.
6. Arma el timeline en DaVinci por script y renderiza en 1080x1920.
7. Con tu OK, lo sube a Drive ordenado por mes.

## 📁 Scripts incluidos

`transcribir.sh`, `voz.sh`, `plan.py`, `persona.swift`, `persona_banda.swift`, `risas_ast.py`, `beats.py`, `mezcla.sh`, `davinci_build.py`, `davinci_render.py`, `subir_drive.sh`.
