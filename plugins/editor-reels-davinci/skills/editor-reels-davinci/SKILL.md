---
name: editor-reels-davinci
description: Esta habilidad debe usarse cuando haya que editar un reel vertical con el flujo de Bakano, en el que DaVinci Resolve hace la edición (cortes, zooms, audio, acabado) y Remotion SOLO genera las gráficas como capas ProRes 4444 con alfa (detrás y delante de la persona). Cubre la estructura de carpetas, transcripción local con WhisperX, limpieza de voz con DeepFilterNet, cortes por palabra, recorte de persona con Apple Vision, gráficas con logos reales, música de Pixabay al compás con ducking, SFX y texturas, armado del timeline en DaVinci por script (MCP de DaVinci Resolve), render y subida a Drive. Úsala siempre que alguien pase clips crudos y pida editar un reel, aunque no nombre la skill. Disparadores: "edítame este reel", "arma el reel", "hazle las gráficas", "ponle música", "¿de dónde saco la música?", "pásalo a DaVinci", "renderiza", "súbelo al Drive".
---

# Editor de reels con DaVinci + Remotion

Regla de oro: **DaVinci edita, Remotion solo dibuja gráficas.** Aunque la persona diga "hazlo en Remotion", se refiere a las gráficas: el reel se arma en DaVinci. Un mp4 completo hecho en Remotion no sirve para retocar a mano.

Los scripts están en `scripts/` dentro de esta skill. Se corren **desde la carpeta del reel**.

## 0. Requisitos (Mac)

| Herramienta | Para qué | Instalación |
|---|---|---|
| DaVinci Resolve Studio + MCP de DaVinci Resolve | armar y renderizar el timeline | instalar Resolve y conectar su MCP en Claude Code |
| FFmpeg | audio, cortes, previews | `brew install ffmpeg` |
| uv | DeepFilterNet, librosa, AST sin ensuciar el sistema | `brew install uv` |
| WhisperX | transcripción local con palabras | viene con el plugin `watch` (`~/.cache/watch/whisperx-venv`) o `uv tool install whisperx` |
| Node.js LTS + Remotion | gráficas | `brew install node` |
| Xcode Command Line Tools | `swift` para recortar a la persona | `xcode-select --install` |
| rclone (opcional) | subir a Drive | `brew install rclone` + `rclone config` con un remoto `gdrive` |

Verifica lo que falte antes de empezar y dile a la persona qué instalar.

## 1. Estructura de carpetas

```
reel-<nombre>/
  crudo/      cNNNN.mov (clips), aNNNN.wav, voz/ (lNNNN.wav limpia, voz_reel.wav cortada), wx/ (json de WhisperX), persona/ (pNNNN.mov con alfa)
  graficos/   proyecto Remotion (src/Reel.tsx, src/data.ts, public/{sfx,marca,img,web})
  davinci/    plan.json, clips/voz_reel_vN.wav, Detras_vN.mov, Delante_vN.mov, Sonido_vN.wav, Musica_vN.wav,
              musica/ (mp3 de Pixabay), fx/ (grain.mp4, leak_warm.mp4, leak_pink.mp4), export/
  Reel <Nombre> vN.mp4
```

Renombrar los clips del celular a `crudo/cNNNN.mov` (NNNN = número de IMG_NNNN). Versionar todo con `_v1`, `_v2`… y nunca sobrescribir una versión que ya se mostró.

## 2. Ver y transcribir

1. Mirar los clips (si está el skill `watch`, usarlo) antes de decidir cortes.
2. `scripts/transcribir.sh NNNN NNNN ...` → `crudo/wx/aNNNN.json` (WhisperX large-v3-turbo, español, en local).
3. Mientras revisas, anota:
   - **Cada marca, app o negocio mencionado** → necesita su logo real.
   - **Gestos de apuntar y paneos al cielo**, aunque no estén en el guion → ahí va una gráfica grande (sección 6).
   - Risas, si es un clip de reunión.

## 3. Voz limpia

`scripts/voz.sh NNNN` por clip: DeepFilterNet (con `uvx`) + EQ de voz, de-esser, compresor, y −14 LUFS → `crudo/voz/lNNNN.wav`.

## 4. Cortes por palabra (plan.py)

Copiar `scripts/plan.py` a la carpeta del reel y llenar:
- `CORTES = [(id, clip, inicio_primera_palabra, inicio_ultima_palabra), ...]` con el texto como comentario (los tiempos salen del json de WhisperX).
- `AJUSTES` para mover a mano un inicio/fin (ej. dejar ver más rato cómo apunta al cielo).
- `FIX` para corregir palabras mal transcritas, `CUE_WORDS` para marcar las palabras donde entran gráficas.

`python3 plan.py` ajusta cada corte con la energía de la voz (respiro antes, cola natural después) y genera `graficos/src/data.ts`, `davinci/plan.json` y `crudo/voz/voz_reel.wav`. Copiar la voz a `davinci/clips/voz_reel_vN.wav`.

Criterios: fuera silencios y muletillas. En reuniones **conservar las risas** (no cortar justo en el remate): `scripts/risas_ast.py ini-fin ...` detecta risas con AST/AudioSet. Una toma descartada graciosa sirve como cola final.

## 5. Recorte de persona (gráficas DETRÁS de la persona)

- Una persona: `swift scripts/persona.swift crudo/cNNNN.mov crudo/persona/pNNNN.mov [desde hasta]` (Apple Vision → ProRes 4444 con alfa). Compilarlo una vez con `swiftc -O` si se va a usar mucho.
- Plano abierto con varias personas (reuniones): `scripts/persona_banda.swift` (segmenta solo la franja con gente; en cuadro completo sale fantasmal).

## 6. Gráficas en Remotion

Proyecto `graficos/` en 1080x1920 a 30 fps, que importa `src/data.ts` (TOTAL, SEGS, CUES, WORDS). Composiciones:
- `Preview`: video + persona + gráficas, solo para revisar en el Studio.
- `Detras`, `Delante` (fondo transparente) y `Sonido` (solo SFX).

Estilo de la casa:
- **Logos reales** de toda marca mencionada: simple-icons (`https://cdn.jsdelivr.net/npm/simple-icons@15.0.0/icons/<nombre>.svg`) para apps y tech; web oficial o redes para negocios locales. Guardar en `public/marca/`. Nada de solo texto + emoji.
- **Nunca tapar la cara.** Todo lo de `Delante` (tarjetas, celular) va del pecho hacia abajo: y > ~1000 px.
- Gráficas **detrás** de la persona (capa Detras + máscara encima): es el efecto que más gusta.
- **Gráficas en el cielo:** si la persona apunta o sube la cámara al cielo, la gráfica aparece AHÍ, grande, con brillo, partículas y profundidad, detrás de su mano; luego el corte vuelve a ella. Medir dónde apunta la mano en el cuadro y anclar ahí.
- Grabaciones de pantalla en `public/web/*.webm`.

Render de capas:
```
npx remotion render Detras  ../davinci/Detras_vN.mov  --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png --concurrency=8 --log=error
npx remotion render Delante ../davinci/Delante_vN.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png --concurrency=8 --log=error
npx remotion render Sonido  ../davinci/Sonido_vN.wav  --codec=wav --log=error
```

## 7. Música: de dónde sale

**Fuente: [Pixabay Music](https://pixabay.com/music/)**: gratis, uso comercial, sin atribución obligatoria.
1. Buscar por estilo en `https://pixabay.com/music/search/<términos>/` (`upbeat funk`, `night trap hip hop`, `chiptune`, `lofi hip hop`…). Que sea instrumental, **sin voces** y con ritmo parejo desde el inicio, acorde al tono del reel.
2. Descargar el mp3 a `davinci/musica/` conservando el nombre con el id (`<artista>-<titulo>-<id>.mp3`).
3. Bajar **3 opciones** y mostrarlas como previews cortas (`opciones-musica/Reel X - Musica A Funk.mp4`, B, C) para que la persona elija. No decidir solo.
4. `uv run --with librosa python scripts/beats.py davinci/musica/<cancion>.mp3` → BPM y tiempos fuertes. Elegir un tiempo fuerte para que caiga en un momento clave de la voz.
5. `scripts/mezcla.sh <cancion.mp3> <beat_s> <cue> davinci/Musica_vN.wav [cue_corte cue_regreso] [cue_apagada]`. Hace offset al compás, fade in de 0.25 s, corte en seco opcional antes de la frase clave con regreso en el beat, música apagada (lowpass) en la toma descartada, **ducking** con la voz como llave y fade out de 0.6 s.
6. Anotar en el proyecto el título, el id de Pixabay, el BPM y el tiempo fuerte usado.

## 8. SFX y texturas

- Usar el banco de SFX y texturas del equipo (packs tipo Cinematic Sound Library, Hollywood Essentials, Vintage SFX; Film Grain 16mm, Light Leaks, VHS, Film Burn, Glitch). Si no hay, Pixabay también tiene efectos de sonido gratis (`https://pixabay.com/sound-effects/`).
- Copiar los que se usen a `graficos/public/sfx/`. Uso típico: whoosh en cortes y entradas de gráfica, click/pop en tarjetas, ding en números, riser antes del momento grande, impact en la palabra clave. En la composición `Sonido`: `<Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} />` dentro de un `<Sequence from={frame}>`.
- Para DaVinci: `davinci/fx/grain.mp4` (grano en loop), `leak_warm.mp4` y `leak_pink.mp4` (leaks cortos de ~24 frames), sacados del banco de texturas.

## 9. Armar en DaVinci (por script, MCP de DaVinci Resolve)

1. `get_resolve_status`; si no está abierto, `launch_resolve`. Llamar `get_whats_new` una vez.
2. Correr `scripts/davinci_build.py` con `run_script` y argumentos `<carpeta_del_reel> "<Nombre>" vN [ids_de_corte_con_leak ...]`.
   - V1 Video (clips originales cortados) · V2 Gráficas detrás · V3 Persona (máscara) · V4 Gráficas delante · V5 Grano (Overlay, 20 %) · V6 Leaks (Screen, 65 %)
   - A1 Voz · A2 SFX · A3 Música
   - Zoom alterno 1.0 / 1.18 por corte, con origen a la altura de la cara (40 % desde arriba), igual en V1 y V3.
   - Si el timeline ya existe crea `vN.2`; no borra nada.
3. Render: `scripts/davinci_render.py <carpeta_del_reel>/davinci/export "<nombre>_vN"` (mp4 H.264, 1080x1920, 30 fps, AAC 48 kHz). Copiar el resultado a `Reel <Nombre> vN.mp4`.
4. Revisar antes de entregar con frames (`ffmpeg -ss t -i video -frames:v 1`) o una hoja de contactos: la cara nunca tapada, las gráficas a tiempo con la voz, la música sin pisar la voz.

## 10. Entrega

- Pasar la ruta del mp4 y qué cambió respecto a la versión anterior. Iterar por versiones.
- Con el **OK final**, subir a Drive: `scripts/subir_drive.sh "<video>" "<Nombre>" [AAAA-MM-DD]` → `<Mes Año>/<AAAA-MM-DD> - <Nombre>.mp4` en el remoto `gdrive` de rclone (cambiarlo con `DRIVE_REMOTE`). **Nunca** crear enlaces públicos (`rclone link` está prohibido).

## Checklist

- [ ] Clips vistos y transcritos con WhisperX
- [ ] Voz limpia a −14 LUFS
- [ ] Cortes en plan.py (risas conservadas si es reunión)
- [ ] Persona recortada (ProRes 4444)
- [ ] Logo real de cada marca mencionada
- [ ] Momentos de apuntar o de cielo con gráfica grande
- [ ] Nada tapa la cara (Delante con y > 1000 px)
- [ ] 3 opciones de música de Pixabay mostradas, una elegida, al compás y con ducking
- [ ] SFX en cortes y gráficas; grano + leaks
- [ ] Timeline armado en DaVinci por script, render vN revisado
- [ ] OK final → Drive
