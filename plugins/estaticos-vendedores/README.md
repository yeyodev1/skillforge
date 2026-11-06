# 🖼️ estaticos-vendedores

**Estáticos para Meta Ads que venden, no solo que se ven bonitos.** Le das el negocio (Instagram, landing o datos a mano) y Claude arma la ficha de marca, propone 3 ángulos de venta, escribe el copy, genera las piezas en 1:1, 4:5 y 9:16, las revisa y te entrega todo listo para subir al Administrador de Anuncios con un test A/B recomendado.

> 🎯 Pensado para traffickers, no diseñadores. Un estático tiene ~1 segundo en el feed: si no se entiende **qué se vende y para quién**, no sirve.

---

## 📦 Instalación

### Opción 1: Claude Code por marketplace (recomendada)

Dentro de Claude Code:

```
/plugin marketplace add yeyodev1/skillforge
/plugin install estaticos-vendedores@skillforge
```

Cierra y vuelve a abrir Claude Code. Para comprobar que quedó: escribe `/plugin` y busca `estaticos-vendedores` en la lista de instalados.

### Opción 2: Claude Code con el ZIP

1. Descarga [`estaticos-vendedores.zip`](https://github.com/yeyodev1/skillforge/releases/tag/estaticos-vendedores-v1.0.0).
2. Descomprímelo en tu carpeta de skills:

```bash
unzip ~/Downloads/estaticos-vendedores.zip -d ~/.claude/skills/
```

3. Debe quedar `~/.claude/skills/estaticos-vendedores/SKILL.md`. Abre una sesión nueva de Claude Code.

> 💡 La skill guarda las fichas de marca nuevas en su propia carpeta (`marcas/<cliente>/ficha.md`). Si vas a trabajar con muchos clientes, la **Opción 2** es más segura: en la Opción 1, una actualización del plugin puede reemplazar esa carpeta. Igual guarda una copia de las fichas importantes.

### Opción 3: Claude.ai (web o app)

1. Descarga el mismo ZIP.
2. En Claude.ai: **Configuración → Capacidades → Skills → Subir skill** y elige el ZIP.

En Claude.ai funciona la parte de estrategia: ficha, ángulos, copy, prompts listos para Higgsfield y el test A/B. La maquetación en HTML (Plan B) y el guardado en `~/Documents` solo funcionan en Claude Code en tu Mac.

---

## ✅ Qué necesitas

Ninguna herramienta es obligatoria: si falta alguna, la skill se salta ese paso, te avisa y sigue. Pero mientras más tengas, mejores piezas salen.

| Herramienta | Para qué la usa | Cómo se instala | ¿Obligatoria? |
|---|---|---|---|
| **Claude Code** | Correr la skill completa | [claude.com/claude-code](https://claude.com/claude-code) | Sí (o Claude.ai con menos funciones) |
| **Higgsfield CLI** | Generar las imágenes (motor 1) | `curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh \| sh` y luego `higgsfield auth login` | Recomendada |
| **Google Chrome** | Plan B: maquetar en HTML y exportar a PNG. También para leer el Instagram con la extensión Claude in Chrome | [google.com/chrome](https://www.google.com/chrome/), instalado en `/Applications` | Solo para el Plan B |
| **Python 3 + Pillow** | Plan B: recortar el borde transparente de logos y fotos | `brew install python` y `pip3 install pillow` | Solo para el Plan B |
| **MCP de Meta Ads** | Paso 3: espiar 3 a 5 anuncios activos de la competencia en la Ads Library | `claude mcp add --transport http meta-ads https://mcp.facebook.com/ads` y luego `/mcp` → autenticar con tu cuenta de Meta | Opcional |
| **Claude in Chrome** | Abrir el Instagram del cliente cuando el fetch normal no carga | Extensión de Chrome "Claude in Chrome" | Opcional |

### Sobre el plan de Higgsfield

- **Plan gratis:** no tiene GPT Image y genera **una imagen a la vez**. La skill usa **Nano Banana 2.1 a 2K** y genera las piezas una por una.
- **Plan pago:** también puede usar GPT Image, que escribe mejor el texto cuando la pieza tiene mucho.

Si no tienes ningún generador, la skill te deja los prompts listos para pegar en Higgsfield.

---

## 🗣️ Cómo usarla

Abre Claude Code en cualquier carpeta y pídelo en lenguaje normal. Cualquiera de estas frases la activa:

- *"Hazme estáticos para Bruval"*
- *"Necesito creativos para pauta de [cliente]"*
- *"Artes para ads de WhatsApp para este servicio: [link de la landing]"*
- *"Imágenes para Meta Ads, objetivo leads"*

No hace falta decir "estático": si pasas un producto o servicio con intención de pautarlo con imágenes, la skill entra sola. **No** es para carruseles orgánicos ni para videos o reels.

### Lo que Claude te va a preguntar

**1. ¿De dónde saco la info?** Link de Instagram, landing, ambos (recomendado: la landing da la oferta y el IG el estilo) o a mano.

**2. El brief** (lo que ya sacó de la landing te lo muestra pre-llenado para que solo confirmes):

| # | Pregunta | Ejemplo |
|---|---|---|
| 1 | Cliente y servicio/producto | Bruval, arreglos BVBOX |
| 2 | Objetivo de campaña | Mensajes de WhatsApp |
| 3 | Público, dolor y objeción | Hombres 25-40 que olvidan fechas; "es caro" |
| 4 | Oferta o gancho | $119 → $89, envío gratis |
| 5 | Referencias de marca | 3 a 6 estáticos ya hechos, **o** logo + colores HEX + tipografías |
| 6 | Formatos | 1:1, 4:5 y 9:16 (por defecto los tres) |
| 7 | Cantidad de conceptos | 3 (por defecto) |

> 💡 Ten a mano el **logo en PNG con fondo transparente** y **fotos reales del producto**. Es lo que más mejora el resultado.

### Lo que pasa después

| Paso | Qué hace Claude | Qué haces tú |
|---|---|---|
| Ficha de marca | Arma paleta, tipografías, estilo, tono, uso del logo y reglas que no se rompen | Confirmas o corriges. Queda guardada para la próxima vez |
| Competencia | Mira 3 a 5 anuncios activos de la competencia (si tienes el MCP de Meta Ads) | Nada |
| 3 ángulos | Propone 3 ángulos **distintos** y recomienda cuál usar de control | Das el visto bueno **antes** de generar (generar gasta créditos) |
| Copy | Titular de máx. ~6 palabras, apoyo, CTA y copy para el Administrador de Anuncios | Nada |
| Imágenes | Genera cada concepto en cada formato, adaptando la composición | Nada |
| Control de calidad | Revisa cada pieza con el checklist de Meta y zonas seguras, y regenera las que fallan | Nada |
| Entrega | Tabla de variantes, copy, test A/B y riesgos | Subes al Administrador de Anuncios |

### Qué recibes al final

1. Resumen: cuántas piezas y dónde están.
2. Tabla: concepto, titular, CTA, formatos e hipótesis de prueba.
3. Por qué funciona cada concepto y para qué temperatura de público (frío o remarketing).
4. Copy para el Administrador de Anuncios por variante: texto principal, título (≤40 caracteres) y botón.
5. Test A/B recomendado: control vs. retador, qué variable se prueba, presupuesto y tiempo orientativo, y métrica de decisión (CPL, costo por conversación, CTR).
6. **Antes de publicar:** riesgos sin resolver, riesgo de rechazo de Meta y coherencia con la landing.

Las imágenes quedan en:

```
~/Documents/BAKANO/estaticos/<cliente>/<AAAA-MM-DD>/<concepto>-<formato>.png
```

Si una pieza no te gusta, pide solo esa: *"regenera la 2 en 9:16 con el botón más arriba"*.

---

## 🧱 Plan B: maquetar en HTML (sin generador de imágenes)

Es la mejor opción cuando el cliente tiene **fotos de producto propias**: el texto sale perfecto, con la tipografía real de la marca, y el producto real es el protagonista. Claude lo hace solo, pero esto es lo que pasa por dentro:

1. Crea una carpeta de trabajo del cliente con una subcarpeta `src/`.
2. Baja a `src/` el logo y las fotos de la web del cliente y recorta su borde transparente.
3. Baja las fuentes de Google Fonts a `src/fonts/`.
4. Copia `scripts/maquetar_html_ejemplo.py` (el caso real de Bruval) y le cambia colores, textos, fotos y fuentes.
5. Exporta los PNG con Chrome headless y revisa una hoja de contacto con todas las piezas antes de entregar.

> ⚠️ El script es un **ejemplo**: no trae las fotos ni las fuentes de Bruval, así que no corre tal cual. Necesita Google Chrome en `/Applications`.

---

## 📏 Reglas que la skill nunca rompe

- **Una idea por pieza:** gancho → beneficio → CTA.
- **Zonas seguras en 9:16:** nada de texto ni botón en el **14% de arriba** ni en el **20% de abajo** (ahí Instagram pone el perfil y la barra de respuesta).
- **Nunca inventa prueba social:** cifras de clientes, porcentajes o dinero solo si vienen de la landing o de ti.
- **Coherencia con la landing:** el anuncio dice lo mismo que la página a la que lleva.
- **Respeta el logo:** su color oficial siempre.
- **Cuidado con Meta:** evita promesas de ingresos con cifras y escasez que deje de ser cierta mientras el anuncio sigue activo.

---

## 📁 Qué incluye

```
estaticos-vendedores/
├── SKILL.md                         # el protocolo paso a paso
├── references/
│   ├── angulos-y-copy.md            # menú de ángulos de venta y ejemplos de copy
│   ├── prompts-imagen.md            # estructura de prompts y ejemplos que funcionaron
│   └── qa-y-politicas-meta.md       # checklist de calidad y políticas de Meta
├── scripts/
│   └── maquetar_html_ejemplo.py     # Plan B: HTML → PNG con Chrome headless
└── marcas/
    ├── bakano/  ficha.md + 7 ejemplos aprobados
    └── bruval/  ficha.md + 9 ejemplos
```

Para sumar un cliente nuevo no tienes que hacer nada: la primera vez la skill arma su ficha y la guarda en `marcas/<cliente>/`.

## 📄 Licencia

MIT © Diego Reyes
