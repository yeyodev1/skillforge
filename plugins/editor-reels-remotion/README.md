# 🎬 editor-reels-remotion

**Edita tus reels pidiéndolos en texto.** Le pasas el video crudo a Claude, le dices qué quieres y él escribe la edición en código con [Remotion](https://www.remotion.dev). Tú la ves en vivo en el navegador y pides cambios hasta que te guste.

> 🔒 Todo corre en tu máquina (FFmpeg, Whisper y Remotion). El video no se sube a ningún servidor.

## 📦 Instalación

```
/plugin marketplace add yeyodev1/skillforge
/plugin install editor-reels-remotion@skillforge
```

O descarga el [ZIP desde Releases](https://github.com/yeyodev1/skillforge/releases).

## 🧰 Qué necesitas

| Herramienta | Para qué | Instalación (Mac) |
|---|---|---|
| Claude Code | el que edita | plan Pro, Max, Team o Enterprise |
| Node.js LTS | Remotion | `brew install node` |
| FFmpeg | silencios, LUT, audio | `brew install ffmpeg` |
| whisper.cpp | subtítulos en local | `brew install whisper-cpp` (si no lo tienes, el skill lo compila solo) |
| Remotion | render del video | lo instala el skill; gratis hasta 3 personas, licencia de empresa por encima |

Opcional: tus efectos de sonido (`whoosh.mp3`, `ding.mp3`), tu LUT `.cube`, tu logo y el nombre de tu fuente.

## 🗣️ Cómo activarlo

- *"Edítame este reel"*
- *"Corta los silencios largos y déjalo con ritmo natural"*
- *"Aplica mi LUT de color look.cube"*
- *"Transcribe el audio y pon subtítulos grandes, de dos o tres palabras"*
- *"Suma un título animado en los primeros dos segundos"*
- *"Pon un whoosh en cada corte y un ding cuando aparece un número"*
- *"Usa mis colores, tipografía y logo"*

## 🧭 Cómo trabaja

1. **Verifica** que tengas Node, FFmpeg y whisper.cpp.
2. **Monta el proyecto** de Remotion una sola vez, con la plantilla del skill (composición 1080x1920 a 30 fps).
3. **Te muestra el plan** y espera tu confirmación.
4. **Procesa** cada pedido y deja el resultado en un JSON del reel (`cortes.json`, `captions.json`, `titulo.json`, `sfx.json`). Cambiar algo después es tocar una línea.
5. **Vista previa** en vivo con `npm run dev` mientras sigues pidiendo cambios.
6. **Exporta** con `npx remotion render` y revisa el MP4 final.

## 📁 Qué incluye

```
editor-reels-remotion/
├── SKILL.md                     # el protocolo
├── scripts/
│   ├── detectar-silencios.mjs   # ffmpeg silencedetect → cortes.json
│   └── transcribir.mjs          # whisper.cpp local → captions.json (tiempos por palabra)
├── plantilla/src/               # Root, marca, Reel, Subtitulos, TituloAnimado, Efectos
└── evals/evals.json
```

## ✅ Cuándo conviene (y cuándo no)

Conviene si editas **muchos reels con el mismo estilo** cada semana. Si es un video suelto o necesitas un trabajo artesanal cuadro a cuadro, un editor tradicional te va a servir mejor.

## 📄 Licencia

MIT © Diego Reyes
