<div align="center">

# ⚒️ SkillForge

**La forja de skills y plugins para Claude Code de [Diego Reyes](https://github.com/yeyodev1)**

Skills de marketing, pauta, estrategia, desarrollo y productividad, listos para instalar en un comando.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin%20Marketplace-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://docs.anthropic.com/en/docs/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Skills](https://img.shields.io/badge/Skills-6-3b82f6?style=for-the-badge)](#-catálogo-de-skills)

</div>

---

## 🤔 ¿Qué es esto?

Un **marketplace de plugins para Claude Code**. Cada plugin agrupa uno o más *skills*: protocolos paso a paso que Claude sigue cuando detecta que tu pedido encaja con lo que el skill sabe hacer.

En lugar de explicarle a Claude cada vez cómo trabajas, lo instalas una vez y él ya sabe.

## 🚀 Instalación rápida

### Opción A: Marketplace (recomendada)

Dentro de Claude Code, agrega este repositorio como marketplace e instala el plugin que quieras:

```
/plugin marketplace add yeyodev1/skillforge
/plugin install estratega-anuncios@skillforge
```

Listo. Cuando salgan nuevas versiones, Claude Code te avisa y actualiza.

### Opción B: ZIP directo (para Claude.ai o compartir por enlace)

1. Ve a [**Releases**](https://github.com/yeyodev1/skillforge/releases) y descarga el `.zip` del skill.
2. En Claude.ai, ve a **Configuración → Capacidades → Skills** y sube el archivo.
3. En Claude Code, descomprímelo dentro de `~/.claude/skills/` (global) o `.claude/skills/` (por proyecto).

Cada ZIP trae la carpeta del skill como raíz, tal como Claude lo espera:

```
estratega-anuncios.zip
└── estratega-anuncios/
    ├── SKILL.md
    └── evals/
        └── evals.json
```

## 📦 Cómo instalar cada skill

En **Claude Code**, agrega el marketplace una sola vez:

```
/plugin marketplace add yeyodev1/skillforge
```

Y luego instala el que necesites con su comando. Para **Claude.ai**, baja el ZIP y súbelo en **Configuración → Capacidades → Skills**.

| Skill | Claude Code | ZIP | Qué necesita aparte |
|---|---|---|---|
| 🎯 [**estratega-anuncios**](plugins/estratega-anuncios) | `/plugin install estratega-anuncios@skillforge` | [estratega-anuncios.zip](https://github.com/yeyodev1/skillforge/releases/download/estratega-anuncios-v1.0.0/estratega-anuncios.zip) | Nada extra. Opcional: MCP de Meta Ads para la Ads Library |
| 🏗️ [**constructor-web-bakano**](plugins/constructor-web-bakano) | `/plugin install constructor-web-bakano@skillforge` | [constructor-web-bakano.zip](https://github.com/yeyodev1/skillforge/releases/download/constructor-web-bakano-v1.1.0/constructor-web-bakano.zip) | Node 20+, pnpm, MCP de MongoDB Atlas y MCP de Google Drive |
| 🎬 [**editor-reels-remotion**](plugins/editor-reels-remotion) | `/plugin install editor-reels-remotion@skillforge` | [editor-reels-remotion.zip](https://github.com/yeyodev1/skillforge/releases/download/editor-reels-remotion-v1.0.0/editor-reels-remotion.zip) | Node, FFmpeg y whisper.cpp (`brew install node ffmpeg whisper-cpp`) |
| 🎞️ [**editor-reels-davinci**](plugins/editor-reels-davinci) | `/plugin install editor-reels-davinci@skillforge` | [editor-reels-davinci.zip](https://github.com/yeyodev1/skillforge/releases/download/editor-reels-davinci-v1.0.0/editor-reels-davinci.zip) | DaVinci Resolve Studio + su MCP, FFmpeg, uv, WhisperX, Node y Xcode CLT |
| 🧸 [**reel-diorama-3d**](plugins/reel-diorama-3d) | `/plugin install reel-diorama-3d@skillforge` | Aún sin ZIP (usa el marketplace) | Paquete Reels Explicativos 0.7+ en `~/reels-explicativos` y copiar el `kit/` |
| 🖼️ [**estaticos-vendedores**](plugins/estaticos-vendedores) | `/plugin install estaticos-vendedores@skillforge` | [estaticos-vendedores.zip](https://github.com/yeyodev1/skillforge/releases/download/estaticos-vendedores-v1.0.0/estaticos-vendedores.zip) | Recomendado: Higgsfield CLI. Opcional: Chrome + Pillow (Plan HTML), MCP de Meta Ads |

Cada skill tiene en su carpeta un README con los requisitos completos y la guía de uso. La más detallada es la de [**estaticos-vendedores**](plugins/estaticos-vendedores#-instalación).

Para actualizar: `/plugin marketplace update skillforge`. Para quitar uno: `/plugin uninstall <nombre>@skillforge`.

## 📚 Catálogo de skills

| Skill | ¿Qué hace? | Disparadores |
|---|---|---|
| 🎯 [**estratega-anuncios**](plugins/estratega-anuncios) | Onboarding de clientes, auditoría de competencia en **Meta Ads Library**, matriz GAP comunicacional y estrategia de pauta con guiones. 100% anuncios pagos. | *"haz el onboarding de este cliente"*, *"audita los anuncios de la competencia de [marca]"*, *"crea la estrategia de anuncios de [negocio]"* |
| 🏗️ [**constructor-web-bakano**](plugins/constructor-web-bakano) | Del brief de la reunión a la plataforma funcionando: `create-backapp` + `create-frontapp`, **MongoDB Atlas por MCP**, Payphone, Bunny Stream, Cloudinary, Resend, contenido desde Drive y accesos de alumnos. | *"haz el back y el front"*, *"construye la web de [cliente]"*, *"sube los cursos del drive"* |
| 🎬 [**editor-reels-remotion**](plugins/editor-reels-remotion) | Edita reels pidiéndolo en texto con **Remotion**: corta silencios, aplica tu LUT, subtítulos estilo TikTok con **Whisper local**, título animado, whoosh y ding automáticos, tu marca y export en 1080x1920. | *"edítame este reel"*, *"corta los silencios"*, *"ponle subtítulos grandes"* |
| 🎞️ [**editor-reels-davinci**](plugins/editor-reels-davinci) | El flujo de Bakano: **DaVinci Resolve** edita por script y **Remotion** solo hace las gráficas detrás y delante de la persona. Voz limpia, cortes por palabra, **música de Pixabay** al compás, SFX, logos reales y subida a Drive. | *"edítame este reel"*, *"ponle música"*, *"pásalo a DaVinci"* |
| 🧸 [**reel-diorama-3d**](plugins/reel-diorama-3d) | Reels **sin cara** en estilo maqueta 3D de juguete: muñequitos cabezones, papel, noche y flash rosa. Guion en escalera «despides al humano, pones una IA, ¿qué falla?». Voz ElevenLabs + HyperFrames + three.js. | *"hazme un video así"*, *"estilo diorama"*, *"muñequitos 3D"* |
| 🖼️ [**estaticos-vendedores**](plugins/estaticos-vendedores) | Estáticos para **Meta Ads** (1:1, 4:5, 9:16) que venden: ficha de marca, 3 ángulos, copy para la pieza y el Administrador de Anuncios, **Higgsfield** o maquetado HTML, control de calidad y test A/B. | *"hazme estáticos para [cliente]"*, *"creativos para pauta"*, *"artes para ads"* |

> 🔜 Más skills en camino. Este repo es el hogar de todos los plugins que publico.

## 🗂️ Estructura del repo

```
skillforge/
├── .claude-plugin/
│   └── marketplace.json          # 📇 Índice del marketplace
├── plugins/
│   └── estratega-anuncios/       # 📦 Un plugin
│       ├── .claude-plugin/
│       │   └── plugin.json       # 🏷️ Metadatos del plugin
│       ├── README.md
│       └── skills/
│           └── estratega-anuncios/
│               ├── SKILL.md      # 🧠 El protocolo que sigue Claude
│               └── evals/        # 🧪 Casos de prueba
├── scripts/
│   └── package.sh                # 📦 Genera los ZIP en dist/
├── LICENSE
└── README.md
```

## 🛠️ Cómo agregar un nuevo skill

1. Crea `plugins/<nombre>/skills/<nombre>/SKILL.md` con su frontmatter (`name` y `description`).
2. Agrega `plugins/<nombre>/.claude-plugin/plugin.json`.
3. Registra el plugin en `.claude-plugin/marketplace.json`.
4. Empaqueta y publica:

```bash
./scripts/package.sh <nombre>        # genera dist/<nombre>.zip
gh release create <nombre>-v1.0.0 dist/<nombre>.zip --title "<nombre> v1.0.0"
```

💡 Tip: el plugin oficial [`skill-creator`](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/skill-creator) de Anthropic ayuda a redactar, probar y optimizar skills. Todos los skills de esta forja se construyen con él.

## 🤝 Contribuir

¿Encontraste un bug o tienes una idea para un skill? Abre un [issue](https://github.com/yeyodev1/skillforge/issues) o manda un PR. Los skills que mejor funcionan son los que nacen de un flujo de trabajo real.

## 📄 Licencia

[MIT](LICENSE) © 2026 Diego Reyes
