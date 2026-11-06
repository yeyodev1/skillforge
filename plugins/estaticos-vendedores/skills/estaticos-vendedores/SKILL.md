---
name: estaticos-vendedores
description: Crea estáticos publicitarios para Meta Ads (feed 1:1, 4:5, stories/reels cover 9:16) pensados para VENDER, respetando la identidad visual de la marca del cliente. Pide la info del negocio (Instagram, landing page o datos a mano), arma ficha de marca, 3 ángulos de venta, copy para la pieza y para el Administrador de Anuncios, genera las imágenes, las pasa por control de calidad y entrega tabla con hipótesis de test A/B. Úsala SIEMPRE que alguien pida "estáticos", "creativos estáticos", "imágenes para pauta", "artes para ads", "piezas para Meta/Facebook/Instagram Ads", "banners para campaña", "creativos para leads/WhatsApp/ventas", o pase un servicio/producto de un cliente con intención de pautarlo con imágenes, aunque no diga la palabra "estático". No usar para carruseles orgánicos ni para videos/reels.
---

# Estáticos vendedores

Esta skill la usa un trafficker: domina la pauta, no es diseñador. Necesita piezas que se puedan subir hoy al Administrador de Anuncios y que vendan, no solo que se vean bonitas. Habla en español latino (Ecuador), directo, sin jerga de agencia.

La lógica de todo: un estático tiene ~1 segundo en el feed. Si en ese segundo no se entiende **qué se vende y para quién**, no importa lo bonito que sea. Por eso cada decisión (titular corto, una sola idea, contraste, CTA) sirve a esa regla.

## Paso 0 — ¿De dónde sacamos la info del negocio?

Antes de cualquier otra pregunta, usa AskUserQuestion:

> "¿Cómo quieres darme la información del negocio?"
- **Link de Instagram** del negocio
- **Landing page / web** (la página a la que va a llevar el anuncio)
- **Ambos** (IG + landing) — recomendado, la landing da la oferta y el IG da el estilo visual
- **Ingresar a mano** (el usuario escribe los datos)

Luego:
- **Landing**: léela (WebFetch o `ctx_fetch_and_index`). Extrae: servicio, promesa, público, oferta, cifras/prueba social, garantías, escasez, CTA y colores/tipos si se ven. La landing es la fuente de verdad del copy: el anuncio debe decir lo mismo que ella (coherencia anuncio→landing sube conversión y evita rechazos).
- **Instagram**: intenta abrirlo con el navegador (claude-in-chrome) o fetch. Si no carga o pide login, avísalo en una línea y sigue con lo demás. **No te detengas por esto.**
- **A mano**: pide los datos en las preguntas del Paso 1.

Antes de preguntar, revisa si ya existe `marcas/<cliente>/ficha.md` dentro de esta skill. Si existe, muéstrala resumida y pregunta si sigue vigente: te ahorras el análisis de marca.

## Paso 1 — Brief (AskUserQuestion, en este orden)

No preguntes lo que ya sacaste de la landing/IG: muéstralo como opción pre-llenada ("Saqué esto de tu landing, ¿confirmas?"). Agrupa máximo 4 preguntas por llamada.

1. Cliente y servicio/producto específico a promocionar.
2. Objetivo de campaña: leads, mensajes de WhatsApp, ventas, tráfico o reconocimiento.
3. Público: quién es, qué le duele, qué objeción tiene para comprar.
4. Oferta o gancho: precio, promo, garantía, urgencia o diferenciador.
5. Referencias de marca (mínimo una):
   - 3 a 6 estáticos ya hechos de la marca (imágenes subidas), o
   - Kit de marca: logo, colores HEX, tipografías.
   - (El IG del Paso 0 cuenta como apoyo, no reemplaza esto si no cargó.)
6. Formatos: 1:1 (1080x1080), 4:5 (1080x1350), 9:16 (1080x1920). Por defecto los tres.
7. Cantidad de variantes/conceptos (por defecto 3).

## Paso 2 — Ficha de marca

De las referencias, resume en una ficha corta:
- Paleta (HEX), con rol de cada color (fondo, acento, CTA, texto).
- Tipografías (o la más parecida disponible) y peso del titular.
- Estilo visual: foto real / 3D / ilustración / glassmorphism / neón, etc.
- Tono del copy (tutea/usted, formal/cercano, emojis sí/no).
- Uso del logo: posición, color, tamaño.
- Composición recurrente (dónde va titular, imagen, CTA).
- Reglas que NO se rompen (ej. color del logo).

Muéstrala y pide confirmación. Al confirmar, guárdala en `marcas/<cliente-en-kebab>/ficha.md` (y copia ahí las referencias si son pocas) para reutilizarla. Mira `marcas/bakano/ficha.md` como ejemplo de ficha bien hecha.

## Paso 3 — Investigación rápida (opcional, no bloquea)

Si está disponible `mcp__meta-ads__ads_library_search`, busca 3–5 anuncios activos de competidores del mismo servicio/país y anota en 3–5 bullets qué ganchos, ofertas y formatos repiten. Sirve para diferenciarse, no para copiar. Si no hay acceso, sáltalo y dilo.

## Paso 4 — Estrategia: 3 ángulos

Propón ángulos **distintos entre sí** (si dos ángulos se parecen, el test A/B no enseña nada). Para cada uno: nombre, idea central en una frase y por qué vende a ESTE público. Consulta `references/angulos-y-copy.md` para el menú de ángulos y ejemplos.

Recomienda cuál pondrías como **control** (el que más probablemente gane) y por qué. Pide visto bueno rápido antes de generar (generar imágenes cuesta créditos).

## Paso 5 — Copy por variante

- **Titular en la pieza**: máximo 6 palabras idealmente, legible en 1 segundo. Si una pregunta calificadora necesita 7–8 ("¿Tu negocio de servicios factura +$8K al mes?") se acepta cuando filtra al público; justifícalo.
- **Apoyo** (opcional, corto): un beneficio o dato.
- **CTA** claro y alineado al objetivo (WhatsApp → "Escríbenos por WhatsApp"; leads → "Solicita tu diagnóstico gratis").
- **Copy para el Administrador de Anuncios**: texto principal (gancho en la primera línea, que es lo que se ve antes del "ver más"), título de Meta (≤40 caracteres) y botón de Meta sugerido.

Las cifras (clientes, %, $) solo si vienen de la landing o del usuario. Nunca inventes prueba social.

## Paso 6 — Generación visual

Elige el motor según lo que haya conectado:

1. **Higgsfield** (si está conectado). Ojo con el plan: en el **plan gratuito no se puede usar GPT Image y solo genera una imagen a la vez** → usa **Nano Banana 2.1 a 2K** y genera las piezas una por una (no en lote). Con plan pago puedes probar GPT Image para piezas con mucho texto.
2. **nanobanana / banana MCP** u otro generador de imágenes.
3. **Plan B sin generador: maquetar en HTML y exportar a PNG con Chrome headless.** Es la mejor opción cuando el cliente tiene fotos de producto propias (web/tienda): el texto sale perfecto, con la tipografía real de la marca, y el producto real es el protagonista. Descarga el logo y las fotos de la web, recorta el borde transparente (PIL `getbbox` sobre el canal alfa), baja las fuentes de Google Fonts en local (`@font-face`) y parte de `scripts/maquetar_html_ejemplo.py` (caso real Bruval: 3 conceptos × 3 formatos, con producto anclado por su base, sombra de piso y zonas seguras). Revisa siempre una hoja de contacto de las 9 piezas antes de entregar.

Si nada de lo anterior es posible, entrega los prompts listos para pegar en Higgsfield y continúa con el resto.

Lee `references/prompts-imagen.md` para la estructura del prompt y ejemplos reales que funcionaron. Reglas de composición:
- Una sola idea por pieza. Jerarquía: gancho → beneficio → CTA.
- Texto en menos del ~20% del área cuando se pueda; contraste alto.
- **9:16: nada de texto ni botón en el 14% superior ni en el 20% inferior** (en 1920px: libre arriba hasta ~270px y abajo desde ~1536px). Ahí van la foto de perfil, el nombre y la barra de respuesta de Instagram, que tapan lo que caiga ahí. Pídeselo explícito al generador: suele poner el botón muy abajo.
- Logo visible pero discreto; respeta su color oficial.
- El protagonista es el producto/servicio, su resultado, o la persona del público. Nada de banco de imágenes genérico.
- Genera cada concepto en los formatos pedidos adaptando la composición (en 1:1 el layout horizontal texto-izq/visual-der funciona; en 9:16 apilado y centrado), no solo recortando.
- Si el texto de la IA sale con errores, regenera una vez; si sigue mal, entrega la imagen **sin texto** + el copy aparte para montarlo en Canva/Figma.

Guarda las imágenes en `~/Documents/BAKANO/estaticos/<cliente>/<AAAA-MM-DD>/` con nombres `<concepto>-<formato>.png`.

## Paso 7 — Control de calidad

Mira cada imagen generada (léela con Read) y pásala por el checklist de `references/qa-y-politicas-meta.md`. Corrige lo que falle antes de entregar (regenera solo las piezas con problema). Lo que no puedas corregir, repórtalo honesto en "Antes de publicar".

Errores que ya han pasado y hay que revisar sí o sí:
- Botón/CTA de stories pegado al borde inferior (zona de la barra de respuesta).
- Elementos que repiten el titular (ej. tarjeta "+20%" cuando el titular ya dice "más de 20%"): desperdician espacio, cambia por otro dato.
- Texto falso o garabatos en elementos decorativos (dashboards con palabras inventadas): que no compitan ni se lean como error.
- Promesas de resultados con cifras (Meta puede leerlas como "afirmaciones de ingresos").
- Escasez ("3 cupos esta semana") que tiene que seguir siendo cierta mientras el anuncio esté activo.

## Paso 8 — Entrega

Formato fijo:

1. **Resumen en 2 líneas**: cuántas piezas, dónde están guardadas.
2. **Tabla de variantes**:

| # | Concepto / ángulo | Titular | CTA | Formatos | Hipótesis de prueba |
|---|---|---|---|---|---|

3. **Los conceptos**: por cada uno, 1–2 líneas de por qué funciona y para qué público/temperatura (frío, remarketing).
4. **Copy para el Administrador de Anuncios** por variante (texto principal, título, botón).
5. **Test A/B recomendado**: qué dos variantes enfrentar primero (control vs. retador), qué variable se está probando, presupuesto/tiempo mínimo orientativo y métrica de decisión (CPL, costo por conversación, CTR).
6. **Antes de publicar**: riesgos de QA no resueltos, riesgo de rechazo de Meta y cuál es la variante más segura, coherencia con la landing.

Al final, muestra las imágenes (rutas absolutas) y ofrece regenerar piezas puntuales.
