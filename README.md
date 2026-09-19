<div align="center">

# ⚒️ SkillForge

**La forja de skills y plugins para Claude Code de [Diego Reyes](https://github.com/yeyodev1)**

Skills de marketing, pauta, estrategia, desarrollo y productividad, listos para instalar en un comando.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin%20Marketplace-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://docs.anthropic.com/en/docs/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Skills](https://img.shields.io/badge/Skills-2-3b82f6?style=for-the-badge)](#-catálogo-de-skills)

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

## 📚 Catálogo de skills

| Skill | ¿Qué hace? | Disparadores |
|---|---|---|
| 🎯 [**estratega-anuncios**](plugins/estratega-anuncios) | Onboarding de clientes, auditoría de competencia en **Meta Ads Library**, matriz GAP comunicacional y estrategia de pauta con guiones. 100% anuncios pagos. | *"haz el onboarding de este cliente"*, *"audita los anuncios de la competencia de [marca]"*, *"crea la estrategia de anuncios de [negocio]"* |
| 🏗️ [**constructor-web-bakano**](plugins/constructor-web-bakano) | Del brief de la reunión a la plataforma funcionando: `create-backapp` + `create-frontapp`, **MongoDB Atlas por MCP**, Payphone, Bunny Stream, Cloudinary, Resend, contenido desde Drive y accesos de alumnos. | *"haz el back y el front"*, *"construye la web de [cliente]"*, *"sube los cursos del drive"* |

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
