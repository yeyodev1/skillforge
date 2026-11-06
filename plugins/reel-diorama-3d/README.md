# 🧸 reel-diorama-3d

Reels verticales **sin cara** en estilo maqueta 3D de juguete, como los de rafaaa.dev
(«una escuela sin maestros», «un editor de video sin humanos»).

- **Guion en escalera:** «Si corres a X y pagas una IA, ya tienes X» → «Pero [fallo]» → «Entonces pones a alguien» →
  «Ese es el [rol]», 5-7 veces, y el giro final.
- **Mundo:** muñequitos cabezones low-poly con caras dibujadas que cambian en la palabra, textura de papel/acuarela,
  noche, ciudad morada, flash rosa entre escenas, viñeta y grano.
- **Subtítulos:** 1-3 palabras blancas apiladas, la palabra clave en serif cursiva.
- Al terminar, te avisa con una notificación del Mac y la ruta del video.

## 📦 Instalación

```
/plugin marketplace add yeyodev1/skillforge
/plugin install reel-diorama-3d@skillforge
```

## Requisitos

- El paquete **Reels Explicativos** (0.7+) en `~/reels-explicativos` (HyperFrames, ElevenLabs, three.js).
- Copia el kit a su plantilla: `cp skills/reel-diorama-3d/kit/* ~/reels-explicativos/plantilla/`.
- `herramientas/montar.mjs` necesita los añadidos del estilo: subtítulo `"diorama"`, entrada `"flash"`, acabado
  `"papel"` y copiar `diorama.js` al proyecto.

## Disparadores

*«hazme un video así»*, *«estilo maqueta / diorama / muñequitos 3D»*, *«como el de los editores»*.
