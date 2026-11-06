---
name: reel-diorama-3d
description: "Hace reels verticales SIN cara en estilo diorama 3D de juguete (low-poly, personajes cabezones con caras dibujadas que cambian de expresión, textura de papel/acuarela, noche, lluvia, flash rosa entre escenas, subtítulos blancos apilados con la palabra clave en serif cursiva), como los reels de rafaaa.dev «una escuela sin maestros» y «un editor de video sin humanos». Usa el paquete ~/reels-explicativos (voz ElevenLabs, HyperFrames, three.js) con el kit plantilla/diorama.js. Úsala cuando Diego pida «un video así / como el de la escuela / como el de los editores / estilo maqueta / diorama / muñequitos 3D / animado 3D sin cara», o pase ese tipo de reel como referencia. NO es para reels donde él sale a cámara (eso es editar-reel-diego)."
---

# Reel diorama 3D

Es un reel explicativo del paquete `~/reels-explicativos`, con su forma fija: la de `estanteria/diorama`.

1. Sigue la skill `reels-explicativos` (lee `~/reels-explicativos/AGENTS.md` y
   `~/reels-explicativos/.claude/skills/video/SKILL.md` con sus `references/`). Todas sus etapas, paradas y reglas
   valen. Herramientas desde `~/reels-explicativos`, con `PATH=/opt/homebrew/opt/ffmpeg-full/bin:$PATH`.
2. **Referencia:** `node herramientas/referencia.mjs --estanteria <diorama|diorama-editores> --proyecto <proyecto>`,
   salvo que Diego pase otro reel de este estilo. `diorama` (la escuela) para instituciones y servicios;
   `diorama-editores` («un editor de video sin humanos») para oficios y equipos digitales (editor, diseñador,
   agencia, community manager).
3. **Aspecto:** `cp plantilla/estilo-diorama.css <proyecto>/estilo.css`.
4. **guion.json**, además de lo normal:
   - `"subtitulos": "diorama"`: 1-3 palabras apiladas; la `clave` de cada frase va en serif cursiva en su línea.
   - `"cursivas": ["palabra", ...]`: más palabras en cursiva (en la referencia, casi una por frase).
   - `"acabado": "papel"`: viñeta y grano encima de todo.
   - `"escenas": { "<escena>": { "entrada": "flash" } }`: destello rosa al cambiar de sitio.
5. **Guion en escalera** (lo que hace funcionar la referencia): «Si haces X, ya tienes Y» → «Pero [fallo concreto que
   se ve]» → «Entonces pones a [alguien]» → «Ese es el [rol]», 5-7 veces; giro final irónico o de marca. Cada fallo
   tiene que poder dibujarse con muñequitos.
6. **Escenas:** una escena por sitio (fachada, salón, oficina, patio…), con varios planos dentro. Pocas escenas: cada
   una abre su propio contexto WebGL. El mundo compartido va en `recursos/mundo.js`.

## Excepciones a escenas.md (solo en este estilo)

- Aquí **sí** se modela a mano con formas simples y **sí** se ven figuras de juguete: ese es el estilo. No se buscan
  .glb; todo sale de `diorama.js`.
- La cámara no está quieta: cada plano lleva su acercamiento lento (`planos()`), y los cortes secos van en palabras.
- Los personajes respiran (`vive()`); eso no es «movimiento sin motivo».

## El kit: `diorama.js`

```js
import { mundo, letras, planos, persona, compu, cara, caraEn, aparece, desaparece, brinco, vive, camina, brazo, mira,
  cuarto, fachada, ciudad, arbol, pupitre, caja, letrero, pizarra, pantalla, lluvia, pinta, V, suave } from "./diorama.js";
await letras();                         // antes de letreros/pizarras (fuentes de estilo-diorama.css)
const E = mundo("#__ID__-3d");          // noche: { cielo, lampara, luz, ambiente, exposicion, lente }
```

| Uso | Qué hace |
|---|---|
| `persona(E, { piel, pelo, peinado: corto\|melena\|moño\|calvo\|pelon, ropa, pantalon, zapatos, lentes, bigote, corbata, adulto, expr })` | muñequito cabezón; origen en los pies, mira a +z; partes en `userData` (cabeza, cuerpo, brazoI/D, piernaI/D) |
| `compu(E, { color, expr, tapa })` | la IA/asistente: caja con la cara en la pantalla |
| `cara(quien, expr)` / `caraEn(quien, s, [[0,"feliz"],[C["llora"],"llora"]])` | expresiones: normal, feliz, sonrisa, risa, triste, llora, sorpresa, duda, guiño, estrellas, enojo, nervioso, dormido |
| `aparece(obj, s, t)` / `desaparece(obj, s, t)` | entra creciendo con rebote / se encoge |
| `brinco(s, t, alto)` | cuánto sube en un salto (súmalo a `position.y`) |
| `vive(p, s, fase)` | respira y ladea la cabeza |
| `camina(p, s, [[t, V(x,0,z)], ...])` | anda entre puntos, gira y mueve piernas y brazos |
| `brazo(p, "I"\|"D", peso)`, `mira(p, V, peso)` | levanta un brazo / gira hacia algo |
| `cuarto(E, { ancho, fondo, alto, pared, pared2, suelo })` | cuarto abierto de maqueta (suelo de baldosas, 2 paredes) |
| `fachada(E, { ancho, alto, pisos, columnas, color })`, `ciudad(E, { z })`, `arbol(E, V)` | exteriores |
| `pupitre(E, V, { ancho, fondo, silla })`, `caja(E, w, h, d, color, V)` | muebles; superficie a y = 0,72 |
| `letrero(E, "salón")`, `pizarra(E, ["2 + 2 = 4"], { dibujo })`, `pantalla(E, { texto, pinta })` | texto a mano, tiza, tablets/móviles |
| `lluvia(E, { n }).poner(s)` | lluvia de rayitas |
| `planos(E, s, [[t, desde, mira, hasta?], ...])` | cortes secos en cada t, con acercamiento lento dentro |
| `pinta(color)` | material de papel para cualquier malla propia |

Los tiempos siempre de `C["palabra"]` (escenas.md). Revisa con `node herramientas/revisar.mjs <proyecto>` y mira las
hojas al lado de `referencia/hoja.jpg`: mismos encuadres de maqueta, caras legibles, nada de la cámara dentro de una
cabeza.

Nota: `montar.mjs` lleva añadidos (subtítulo «diorama», entrada «flash», acabado «papel», copia de `diorama.js`). Si
el paquete se actualiza y los pierde, se vuelven a poner (copia original en el historial de esta skill).

## Al terminar

El vídeo queda en `~/reels-explicativos/trabajo/salida/`. Avisa a Diego con una notificación del Mac y dale la ruta:

```bash
osascript -e 'display notification "<ruta del mp4>" with title "Reel diorama listo" sound name "Glass"'
```
