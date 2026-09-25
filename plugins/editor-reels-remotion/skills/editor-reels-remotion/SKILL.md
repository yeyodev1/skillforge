---
name: editor-reels-remotion
description: >-
  Esta habilidad debe usarse cuando haya que editar un reel, TikTok o short vertical con código usando Remotion y
  Claude Code: montar el proyecto de Remotion, cortar silencios, aplicar un LUT de color (.cube), transcribir en local
  con Whisper y poner subtítulos grandes de 2 o 3 palabras estilo TikTok, sumar un título animado al inicio, poner
  efectos de sonido (whoosh en cada corte, ding en los números), aplicar la marca (colores, tipografía, logo) y
  exportar el MP4 final en 1080x1920. Todo en local, sin subir el video a ningún servidor.
  Úsala siempre que el usuario tenga un video crudo y quiera editarlo "pidiéndolo en texto", aunque no nombre Remotion.
  Disparadores: "edítame este reel", "corta los silencios", "ponle subtítulos grandes", "aplica mi LUT",
  "ponle un whoosh en cada corte", "usa mis colores y mi logo", "monta el editor de reels", "renderiza el reel",
  "quiero editar reels con Claude Code y Remotion".
---

# Editor de Reels con Claude Code + Remotion

El reel no se edita en una línea de tiempo con el mouse: se describe en código. Remotion es React que renderiza video,
así que cada corte, subtítulo y sonido vive en un archivo de datos o un componente. Eso trae dos ventajas que son la
razón de ser de esta skill:

1. **Iterar es barato.** "Deja más aire en el segundo corte" es cambiar un número, no volver a editar.
2. **Se repite solo.** El reel de la próxima semana usa el mismo proyecto, la misma marca y los mismos pedidos.

Esta forma de trabajar rinde en **edición repetida y en volumen** (varios reels por semana con el mismo estilo). Si el
usuario quiere un trabajo artesanal cuadro a cuadro o es un video suelto, díselo con honestidad: un editor tradicional
le va a servir mejor.

Todo corre en la máquina del usuario: FFmpeg, Whisper y Remotion. El video nunca se sube a ningún servidor.

---

## Fase 0: Verificar el entorno

Antes de tocar el video, comprueba qué hay instalado. No asumas nada.

```bash
node -v            # necesita Node LTS (18+)
ffmpeg -version    # silencios, LUT, extracción de audio
which whisper-cli  # whisper.cpp del sistema (recomendado)
```

Si falta algo, dile al usuario exactamente cómo instalarlo y espera:

| Falta | Mac | Windows |
|---|---|---|
| Node.js | `brew install node` o nodejs.org (LTS) | instalador LTS de nodejs.org |
| FFmpeg | `brew install ffmpeg` | `winget install ffmpeg` |
| whisper.cpp | `brew install whisper-cpp` (recomendado: versión reciente, mejor en español) | el script lo instala solo con `@remotion/install-whisper-cpp` |

**Licencia de Remotion:** es gratis para personas y empresas de hasta 3 personas. Si el usuario trabaja en una agencia o
empresa más grande, avísale que necesita la licencia de empresa (remotion.pro) antes de usarlo con clientes.

---

## Fase 1: Montar el proyecto (una sola vez)

Si el usuario ya tiene un proyecto de editor, úsalo y salta a la Fase 2. Si no:

```bash
npx create-video@latest --yes --blank mi-editor
cd mi-editor && npm install
npx skills add remotion-dev/skills   # las reglas oficiales de Remotion para Claude
npx remotion add @remotion/captions @remotion/install-whisper-cpp @remotion/google-fonts
printf 'whisper.cpp/\nwhisper-sistema/\nwhisper-modelos/\nout/\n' >> .gitignore
```

Deja esta estructura. Separar los **datos** (qué cortar, qué decir, qué sonar) de los **componentes** (cómo se ve) es lo
que hace que las iteraciones sean de una línea:

```
mi-editor/
├── public/
│   ├── crudo/            # videos originales, nunca se modifican
│   ├── sfx/              # whoosh.mp3, ding.mp3, pop.mp3...
│   ├── marca/            # logo.png, fuentes, look.cube
│   └── reels/<slug>/     # un folder por reel: video procesado + JSON de datos
├── src/
│   ├── Root.tsx          # registra una <Composition> por reel
│   ├── marca.ts          # colores, fuentes y logo en un solo lugar
│   └── reel/
│       ├── datos.ts      # tipos, cálculo de frames y remapeo de subtítulos
│       ├── Reel.tsx      # arma cortes + subtítulos + título + sfx + logo
│       ├── Subtitulos.tsx
│       ├── TituloAnimado.tsx
│       └── Efectos.tsx
└── scripts/              # copia aquí los scripts de esta skill
```

Copia los archivos de esta skill al proyecto (sustituye el `src/Root.tsx` del template y borra `src/Composition.tsx`):

```bash
cp -R <skill>/plantilla/src/. mi-editor/src/ && rm -f mi-editor/src/Composition.tsx
mkdir -p mi-editor/scripts && cp <skill>/scripts/*.mjs mi-editor/scripts/
```

`<skill>` es la carpeta donde vive este SKILL.md. La plantilla está probada con Remotion 4.0.5xx: renderiza tal cual.

**Composición:** 1080x1920, 30 fps. `calcularReel` (en `Reel.tsx`) lee los JSON de `public/reels/<slug>/` y calcula
la duración a partir de los cortes, nunca a mano. Para agregar un reel basta con sumar `{ slug, crudo }` al arreglo
`reels` de `Root.tsx`; el id de la composición será `Reel-<slug>`.

---

## Fase 2: Recibir el video y confirmar el plan

1. Pide al usuario que ponga el video crudo en `public/crudo/` (o copia tú el archivo que te indique). Crea
   `public/reels/<slug>/` con un slug corto (`reel-2026-09-25-precios`).
2. Inspecciona el video: `ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name:format=duration -of json <video>`.
   Si viene horizontal, pregunta si recortar al centro o poner fondo desenfocado. Si viene en 60 fps o HDR, avísalo.
3. Presenta el plan en una tabla corta (qué se va a hacer y con qué parámetros) y **espera confirmación** antes de
   procesar. Un ejemplo:

| Paso | Detalle |
|---|---|
| Silencios | cortar pausas de más de 0.5 s, dejar 0.12 s de aire |
| Color | LUT `marca/look.cube` al 100 % |
| Subtítulos | 2–3 palabras, fuente de la marca, palabra activa resaltada |
| Título | "3 errores al fijar precios" en los primeros 2 s |
| SFX | whoosh en cada corte, ding cuando aparece un número |

Si el usuario solo pidió una cosa ("córtale los silencios"), haz solo esa. No agregues pasos que no pidió.

---

## Fase 3: Los seis pedidos

Cada pedido deja su resultado en `public/reels/<slug>/` como archivo de datos. El componente `Reel.tsx` lee esos
archivos. Así, rehacer un paso nunca rompe los otros.

### 3.1 Cortar silencios → `cortes.json`

"Corta los silencios largos y déjalo con ritmo natural."

```bash
node scripts/detectar-silencios.mjs public/crudo/video.mp4 public/reels/<slug>/cortes.json --umbral -35 --min 0.5 --aire 0.12
```

El script corre `ffmpeg silencedetect`, invierte los silencios en tramos que se conservan y guarda
`[{ "desde": 0.00, "hasta": 3.42 }, ...]` en segundos del video original.

- **Ritmo natural = no cortar todo.** Deja 0.10–0.15 s de aire antes y después de cada tramo; sin eso las frases se
  pegan y suena robótico.
- Si el audio tiene ruido de fondo, sube el umbral (`-30`); si corta palabras suaves, bájalo (`-40`).
- "Más dinámico" → `--min 0.3 --aire 0.08`. "Menos cortes" → `--min 0.8`.
- Los cortes se aplican en Remotion con `<Series>` de `<OffthreadVideo>` recortados (`trimBefore`/`trimAfter`), no se
  re-codifica el video. Si el proyecto usa Remotion < 4.0.319, cambia esas props por `startFrom`/`endAt`.
- Para ajustar un corte a mano, edita `cortes.json` directamente: son segundos del video original.

### 3.2 Aplicar LUT de color → `graded.mp4`

"Aplica mi LUT de color look.cube."

Remotion no lee archivos `.cube`, así que el color se hornea con FFmpeg una vez y Remotion usa el video ya corregido:

```bash
ffmpeg -i public/crudo/video.mp4 -vf "lut3d=public/marca/look.cube" -c:v libx264 -crf 16 -preset slow -c:a copy public/reels/<slug>/graded.mp4
```

- Intensidad parcial ("que se note menos"): mezcla original y LUT:
  `-filter_complex "[0:v]split[a][b];[b]lut3d=public/marca/look.cube[c];[a][c]blend=all_mode=normal:all_opacity=0.6"`
- Si el video viene en log (S-Log, V-Log), el LUT de conversión va primero y el creativo después: `lut3d=conv.cube,lut3d=look.cube`.
- `calcularReel` usa `graded.mp4` automáticamente si existe; si no, el crudo. Para quitar el color, borra `graded.mp4`.

### 3.3 Subtítulos grandes → `captions.json`

"Transcribe el audio y pon subtítulos grandes, de dos o tres palabras."

```bash
node scripts/transcribir.mjs public/crudo/video.mp4 public/reels/<slug>/captions.json --idioma es --modelo medium
```

El script extrae el audio a WAV 16 kHz mono, transcribe con whisper.cpp con marcas de tiempo por palabra (DTW), une
los trozos de palabra ("cop" + "iar") y guarda el formato `Caption[]` de `@remotion/captions`. Luego imprime el texto
completo y la lista de palabras dudosas.

- **Motor:** si hay `whisper-cli` en el PATH (`brew install whisper-cpp`), usa ese: es reciente y transcribe bastante
  mejor el español. Si no, compila whisper.cpp 1.5.5 en `./whisper.cpp` (tarda unos minutos la primera vez). El
  script ya pasa `-nfa` al binario reciente, porque con flash attention activa whisper.cpp apaga el DTW y los
  subtítulos salen adelantados.
- **Modelos:** se guardan en `./whisper-modelos/`. Si ya existe `~/.cache/whisper-models/ggml-<modelo>.bin`, se
  reutiliza en vez de descargarlo de nuevo (medium pesa ~1.5 GB).

- **Idioma:** pasa siempre `es` (o el que corresponda). Nunca uses modelos `.en` para español.
- **Modelo:** `medium` es el equilibrio para español. `small` si la máquina es lenta; `large-v3-turbo` si hay muchos
  nombres propios o jerga.
- **Remapeo tras los cortes (lo que más se rompe):** la transcripción está en tiempos del video original, pero el reel
  ya no tiene silencios. `Reel.tsx` pasa los captions por `remapearCaptions(captions, cortes)` (en
  `plantilla/src/reel/datos.ts`), que descarta las palabras caídas en silencios y desplaza el resto. Nunca transcribas
  el video ya cortado ni calcules los tiempos a mano.
- **Agrupar en 2–3 palabras:** `AGRUPAR_MS` en `Subtitulos.tsx` (600 por defecto) va a
  `createTikTokStyleCaptions`. Menos milisegundos = menos palabras por pantalla. Si alguna queda con más de 3
  palabras, baja el valor; si parpadean demasiado, súbelo.
- **Revisión obligatoria:** después de transcribir, muestra al usuario el texto completo y las palabras dudosas que
  imprime el script, y corrige en `captions.json` solo el campo `text` (conserva el espacio inicial y los tiempos).
  Whisper confunde nombres propios, marcas y palabras parecidas ("hora" por "ahora"). Un error de ortografía en el
  subtítulo se nota más que cualquier otro fallo.
- **Zona segura:** los subtítulos van entre el 55 % y el 70 % de la altura. Arriba tapa la cara; abajo los tapa la
  interfaz de Instagram y TikTok (evita los 420 px inferiores y los 220 px superiores).

### 3.4 Título animado → `titulo.json`

"Suma un título animado en los primeros dos segundos."

Guarda `{ "texto": "...", "duracion": 2 }`. `TituloAnimado.tsx` entra con `spring()` (escala + opacidad), se sostiene y
sale en los últimos 8 frames. Toda animación se hace con `useCurrentFrame()`, `spring()` e `interpolate()`:
**nunca** con CSS transitions, `@keyframes` ni librerías de animación del navegador, porque el render no las captura.
Mientras el título está en pantalla, los subtítulos se ocultan para no competir. Sin `titulo.json` no hay título.

### 3.5 Efectos de sonido → `sfx.json`

"Pon un whoosh en cada corte y un ding cuando aparezca un número."

```json
{
  "whoosh": { "archivo": "sfx/whoosh.mp3", "volumen": 0.5 },
  "ding": { "archivo": "sfx/ding.mp3", "volumen": 0.6 },
  "extra": [{ "archivo": "sfx/pop.mp3", "en": 4.2, "volumen": 0.4 }]
}
```

`Efectos.tsx` calcula los tiempos solo, así que casi nunca hay que escribir segundos a mano:

- **`whoosh`:** suena en cada unión entre tramos de `cortes.json`, adelantado 0.08 s para que el pico caiga en el
  corte. Si dos cortes están a menos de 1 s, el segundo no lleva whoosh: saturar cansa.
- **`ding`:** suena al inicio de cada palabra con número en los subtítulos ya remapeados (dígitos o "dos", "tres",
  "cien", "mil", "mitad"...). Si suena en una palabra que no debía, corrige `tieneNumero` en `datos.ts` o pasa ese
  sonido a `extra`.
- **`extra`:** sonidos puntuales en segundos del reel ya cortado (el tiempo que muestra Remotion Studio).
- Quita una clave para quitar ese efecto.
- Los SFX se reproducen con `<Sequence from={...}><Audio src={staticFile(...)} volume={...} /></Sequence>`, así que
  deben existir en `public/`; si falta un archivo, el render falla.
- **Si no hay archivos de sonido,** pregunta al usuario si tiene una librería. Si tiene API key de ElevenLabs, puedes
  generarlos con su API de efectos de sonido (`POST /v1/sound-generation`) y guardarlos en `public/sfx/`. No descargues
  sonidos de páginas al azar: pueden tener copyright.
- Baja la voz a 1.0 y los SFX entre 0.3 y 0.6. Nunca deben tapar lo que se dice.

### 3.6 Marca → `src/marca.ts`

"Usa mis colores, tipografía y logo."

Un solo archivo con los tokens de la marca. Todos los componentes leen de ahí:

```ts
export const marca = {
  colores: { primario: '#FF3D00', texto: '#FFFFFF', resaltado: '#FFE600', sombra: 'rgba(0,0,0,0.85)' },
  fuente: 'Montserrat',          // Google Fonts vía @remotion/google-fonts, o local con loadFont
  pesoSubtitulos: 900,
  logo: 'marca/logo.png',        // o null; se pone arriba a la derecha, 110 px, opacidad 0.9
};
```

- Si el usuario da un manual de marca, un link o una imagen, extrae de ahí los colores y la fuente y confírmalos.
- Fuente de Google: `loadFont()` de `@remotion/google-fonts/<Fuente>`. Fuente propia: ponla en `public/marca/` y usa
  `loadFont` de `@remotion/fonts`.
- Si la fuente no carga a tiempo, el render sale con la fuente por defecto. Por eso se carga con `loadFont` y no con CSS.

---

## Fase 4: Vista previa e iteración

```bash
npm run dev    # Remotion Studio en http://localhost:3000
```

Pide al usuario que tenga el Studio abierto en el navegador mientras le pide cambios a Claude en la terminal. Cada
cambio a un JSON o componente se refresca solo. Traduce cada pedido al archivo que toca:

| Pedido | Archivo |
|---|---|
| "el corte del segundo 12 queda brusco" | `cortes.json`: amplía `hasta` del tramo anterior |
| "los subtítulos más arriba / más grandes" | `Subtitulos.tsx` (posición, tamaño) |
| "esa palabra está mal escrita" | `captions.json` |
| "el whoosh suena muy fuerte" | `sfx.json` (volumen) |
| "cambia el título" | `titulo.json` |

Nunca re-proceses el video completo por un cambio que se resuelve en un JSON.

---

## Fase 5: Exportar

```bash
npx remotion render Reel-<slug> out/<slug>.mp4 --codec h264 --crf 18 --audio-codec aac
```

- Especificaciones para Instagram y TikTok: 1080x1920, 30 fps, H.264, AAC. Si el reel supera los 90 s, avisa al usuario
  antes de publicarlo: Instagram lo puede tratar distinto.
- Revisa el archivo final con `ffprobe` (resolución, duración, que tenga audio) y dile al usuario dónde quedó.
- Si el usuario tiene la skill `publicar-ig` o similar, ofrece publicarlo; no lo publiques sin que lo pida.

---

## Reutilizar para el siguiente reel

Cuando el usuario diga "haz lo mismo con este otro video", no vuelvas a montar nada: crea
`public/reels/<nuevo-slug>/`, corre los scripts con los mismos parámetros que funcionaron la última vez y registra una
nueva `<Composition>` en `Root.tsx`. Guarda los parámetros que al usuario le gustaron (umbral de silencio, aire,
agrupación de palabras, volúmenes) en `mi-editor/preset.json` para que la próxima vez sean el punto de partida.

## Reglas que no se rompen

- El video crudo en `public/crudo/` nunca se modifica ni se borra.
- Nada de animaciones CSS, `setTimeout` ni `Math.random()` sin semilla en componentes: el render sale distinto a la
  vista previa. Usa `random('semilla')` de Remotion.
- Videos con `<OffthreadVideo>`, no `<Video>` de HTML, para que el render sea exacto por frame.
- Nunca subas el video a un servicio externo sin permiso explícito del usuario.
- Si un paso falla (Whisper no instala, el LUT da error), dilo con el error real. No entregues un reel incompleto como
  si estuviera terminado.

## Archivos de esta skill

- `scripts/detectar-silencios.mjs`: silencios → `cortes.json`
- `scripts/transcribir.mjs`: audio → `captions.json` con whisper.cpp local
- `plantilla/src/`: `Root.tsx`, `marca.ts` y `reel/` (`datos.ts`, `Reel.tsx`, `Subtitulos.tsx`, `TituloAnimado.tsx`,
  `Efectos.tsx`), listos para copiar al proyecto
