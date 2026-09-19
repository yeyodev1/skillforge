---
name: constructor-web-bakano
description: >-
  Esta habilidad debe usarse cuando haya que construir de punta a punta una web, plataforma de cursos, membresía
  o tienda para un cliente a partir de un brief, notas de reunión o transcripción: scaffolding del backend y el frontend
  con `npx create-backapp` y `npx create-frontapp`, proyecto y cluster en MongoDB Atlas vía MCP con el `DB_URI` ya puesto
  en el `.env`, pagos con la Cajita de Pagos de Payphone, videos en Bunny Stream, imágenes en Cloudinary, correos con Resend,
  carga del contenido del cliente desde Google Drive como productos, cuenta de alumno demo y accesos manuales con o sin
  vencimiento. Úsala siempre que el usuario pegue notas de una reunión con un cliente junto con credenciales y pida
  "hacer el back y el front", aunque no nombre la skill.
  Disparadores: "necesitamos hacer una plataforma", "haz el back y el front", "construye la web de [cliente]",
  "arma la tienda de [cliente]", "crea el proyecto en mongo y configura el .env", "sube los cursos del drive".
---

# Constructor Web Bakano: del brief de la reunión a la plataforma funcionando

Esta habilidad convierte las notas de una reunión con un cliente en una plataforma completa: dos repos
(`<cliente>-backapp` y `<cliente>-frontapp`), base de datos en Atlas, integraciones conectadas, contenido cargado y
accesos listos para que el cliente la revise.

El orden de las fases importa. El scaffolding fija las convenciones, Atlas da el `DB_URI` sin el cual el backend no
arranca, y el contenido solo se puede subir cuando los modelos y los servicios de Bunny y Cloudinary ya existen.
No te saltes fases ni las reordenes.

## Reglas duras (aplican a todo el trabajo)

1. **Siempre los CLIs.** El backend nace con `npx create-backapp` y el frontend con `npx create-frontapp`. Nunca copies
   otro repo ni armes la estructura a mano: los CLIs ya traen auth, errores, CORS, Vercel, tokens SCSS y `CLAUDE.md`.
2. **Secretos solo en `.env`.** Las credenciales llegan pegadas en el chat. Van al `.env` del backend y a ningún otro
   lugar: ni commits, ni mensajes de commit, ni README, ni `CLAUDE.md`, ni `.env.example` (ahí solo el nombre de la
   variable vacío), ni prompts de subagentes que no las necesiten. Antes del primer commit corre
   `git check-ignore .env` y confirma que responde `.env`.
3. **Mobile first.** Los estilos base son para 360 px; lo demás se agrega con `@include from('md')` hacia arriba.
4. **Prohibido `display: grid`.** Todo layout es flexbox. Para "grillas" de tarjetas usa el mixin `flex-cards($basis, $gap)`.
   Al terminar, `grep -rn "display: grid\|grid-template" src/` en el frontapp debe salir vacío.
5. **Un commit por archivo, en `main`.** `git add <archivo> && git commit -m "feat: ..."`, mensaje en español y
   convencional (`feat:`, `fix:`, `chore:`). Nunca `git add .` ni `git add -A`.
6. **Subagentes para el trabajo pesado.** Ver la sección *Orquestación*.
7. **Convenciones de cada repo.** Manda el `CLAUDE.md` que deja cada CLI: backapp con comillas dobles y punto y coma,
   capas routes → controllers → services → models, `CustomError` en español; frontapp con `<script setup lang="ts">`,
   sin punto y coma, comillas simples, máximo 300 líneas por `.vue`, copy en `src/config/site.ts`, sin librerías UI ni Tailwind.
8. **Avisa al terminar.** El usuario queda esperando: cierra con el reporte de la Fase 8.

## Fase 0: leer el brief y armar la ficha

Lee completas las notas, la transcripción y todo lo que el usuario pegó. Extrae y muestra una ficha corta:

- **Cliente y slug** (`mariana-ortiz` → repos `mariana-ortiz-backapp` / `-frontapp`).
- **Qué se vende:** cursos grabados, recursos descargables, sesiones 1:1, membresía, productos físicos. De esto salen los módulos.
- **Módulos que aplican:** pagos (Payphone), video (Bunny), archivos (Cloudinary), correo (Resend), contenido (Drive), accesos de alumno.
- **Web de referencia** si la hay: visítala y saca paleta, tipografías, tono del copy, estructura de navegación y textos legales.
- **Dominios:** producción y preview (`https://dev-<proyecto>-front.bakano.ec`).
- **Credenciales recibidas y faltantes**, por nombre de variable, sin repetir los valores.

### Qué pedir y cuándo

No exijas todo al inicio ni asumas que el usuario ya lo pegó. Pide lo mínimo para arrancar y el resto cuando llega la
fase que lo necesita. Lo que ya venga en el mensaje no se vuelve a preguntar: se confirma en la ficha.

| Momento | Se pide (solo si falta) |
|---|---|
| Antes de la Fase 1 | Nombre del cliente, qué vende, dominio de producción, color o web de referencia |
| Antes de la Fase 2 | Nada si el MCP de Atlas responde. Si no está configurado, el `DB_URI` de un cluster existente |
| Antes de la Fase 4 | Según los módulos de la ficha: token y store id de Payphone; library id, CDN hostname y API key de Bunny; cloud name, key y secret de Cloudinary; API key de Resend y remitente |
| Antes de la Fase 6 | Enlace de la carpeta de Drive, compartida con la cuenta conectada al MCP |
| Antes de la Fase 7 | Correo para el alumno demo y cuánto dura el acceso de una compra |

Agrupa las preguntas de cada momento en un solo mensaje, y mientras esperas respuesta avanza con lo que no depende de ella.

Si el usuario no tiene un dato que bloquea un módulo (por ejemplo todavía no le dan el token de Payphone), sigue con
todo lo demás, deja ese módulo listo para enchufar con la variable vacía y repórtalo al final. No frenes el proyecto
entero por una credencial.

## Fase 1: scaffolding

Verifica que los CLIs respondan con `command -v create-backapp create-frontapp`. Si no están, se enlazan desde
`~/tools/scaffolding/create-backapp` y `create-frontapp` con `npm link` en cada carpeta.

```bash
mkdir -p ~/projects/work/bakano/clients/<cliente> && cd ~/projects/work/bakano/clients/<cliente>
npx create-backapp  <cliente> -y --uploads --domain <dominio-produccion>
npx create-frontapp <cliente> -y --title "<Nombre visible>" --color "<#hex de marca>" --domain <dominio-produccion>
```

- `--uploads` siempre que haya portadas, imágenes o archivos (casi siempre).
- `--cron` si hay tareas programadas: vencimiento de accesos, recordatorios, reportes.
- `--gsap` solo si el brief pide animación rica.
- `-y` es obligatorio: sin él el CLI hace preguntas interactivas que un agente no puede contestar.
- El backapp nace con su `.env` listo: `JWT_SECRET` y `ADMIN_PASSWORD` generados y `DB_URI` apuntando a Mongo local.
  Esa línea `DB_URI` es la que reemplaza la Fase 2.
- Cada CLI deja el repo con `git init`, dependencias instaladas y el primer commit. Confirma que la rama se llama `main`
  (`git branch -M main` si hace falta).

**CORS:** la plantilla ya acepta `localhost`, `*.vercel.app`, `*.trycloudflare.com` y `*.bakano.ec`, así que
`https://dev-<proyecto>-front.bakano.ec` entra sin tocar nada. El dominio de producción entra por `--domain`; cualquier
otro origen va en `CORS_ORIGINS` del `.env`, separado por comas.

## Fase 2: MongoDB Atlas por MCP

Sigue `references/atlas-mongo.md`. Resumen: proyecto nuevo en Atlas con el nombre del cliente → cluster gratuito →
usuario de base de datos con contraseña generada → access list `0.0.0.0/0` (Vercel no tiene IPs fijas, por eso
"desde cualquier IP") → connection string → `DB_URI` escrito en el `.env` del backapp.

Verifica arrancando el backend: `pnpm dev` y `curl localhost:8100/api/health`. Si no conecta, no sigas a la Fase 3.

## Fase 3: variables de entorno

Escribe en el `.env` del backapp todo lo recibido y replica **solo los nombres** en `.env.example`. Lee cada variable
únicamente desde `src/config/env.ts`.

| Módulo | Variables |
|---|---|
| Base | `DB_URI` (Fase 2), `JWT_SECRET` (ya lo generó el CLI: no lo cambies), `FRONTEND_URL`, `CORS_ORIGINS` |
| Admin | `ADMIN_EMAIL`, `ADMIN_PASSWORD` (ya lo generó el CLI: no lo cambies, repórtalo al final), `ADMIN_NAME` |
| Alumno demo | `DEMO_STUDENT_EMAIL`, `DEMO_STUDENT_PASSWORD` |
| Payphone | `PAYPHONE_TOKEN`, `PAYPHONE_STORE_ID` |
| Bunny Stream | `BUNNY_LIBRARY_ID`, `BUNNY_CDN_HOSTNAME`, `BUNNY_STREAM_API_KEY`, `BUNNY_STREAM_READ_KEY`, `BUNNY_ACCOUNT_API_KEY`, `BUNNY_TOKEN_AUTH_KEY` |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Resend | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |

En el frontapp solo va `VITE_API_BASE_URL`. Todo `VITE_*` queda expuesto en el navegador: ahí nunca va un secreto.

## Fase 4: backend

Modela según la ficha. Para una plataforma de cursos o tienda digital, la base es:

- `product` — `type: "course" | "download" | "service" | "physical"`, slug, título, descripción, precio en centavos, portada (Cloudinary), `isPublished`.
- `module` y `lesson` — orden, título, `bunnyVideoId`, duración, adjuntos, `isFreePreview`.
- `order` — usuario, ítems, total en centavos, `clientTransactionId`, estado, respuesta de Payphone.
- `access` — quién puede ver qué y hasta cuándo. Ver `references/accesos-alumnos.md`.

Integraciones, cada una en su `x.service.ts`:

- **Payphone:** `references/payphone.md`. El monto se calcula en el servidor y el pago se confirma en el servidor.
- **Bunny Stream:** `references/bunny-stream.md`. El frontend nunca ve la API key; recibe URLs de embed firmadas.
- **Cloudinary y Resend:** ya vienen en la plantilla (`cloudinary.service.ts` con `--uploads`, `email.service.ts`).
  Agrega los correos transaccionales: bienvenida, compra confirmada, acceso otorgado, acceso por vencer.

Panel de administración (rutas bajo `adminMiddleware`): CRUD de productos, módulos y lecciones, subida de portada,
subida de video, órdenes, alumnos y accesos manuales.

La verificación del backend es `pnpm build` sin errores más una pasada con `curl` por el flujo principal.

## Fase 5: frontend

Vistas mínimas para una plataforma de cursos: home, catálogo, detalle de producto, checkout con la Cajita de Pagos,
página de respuesta del pago, login y registro, "Mis cursos", reproductor de lección, y el panel admin (productos,
contenido, órdenes, alumnos y accesos).

- Identidad desde la web de referencia: paleta en `colorVariables.module.scss`, fuentes en `index.html`, copy en `site.ts`.
- La Cajita de Pagos se monta con estilos propios: contenedor, encabezado y resumen del pedido son nuestros, en SCSS.
- Revisa cada vista a 360 px antes que en desktop. Verificación: `pnpm build` y recorrido en navegador.

## Fase 6: contenido desde Google Drive

Sigue `references/contenido-drive.md`. Resumen: recorrer la carpeta con el MCP de Drive → proponer el mapeo
carpeta → producto → módulos → lecciones → portadas a Cloudinary, videos a Bunny (una colección por curso), documentos
como adjuntos → crear los documentos en Mongo por el API del propio backend con el token del admin.

El script de carga vive en `src/scripts/` del backapp, es idempotente (busca por slug antes de crear) y se commitea.
No inventes descripciones ni precios: lo que no esté en el Drive ni en el brief queda como borrador (`isPublished: false`)
y va a la lista de pendientes.

## Fase 7: accesos

Sigue `references/accesos-alumnos.md`. Tres cosas deben quedar funcionando:

1. **Alumno demo** sembrado con `pnpm seed:student`, con acceso a todos los productos, para ver la plataforma como alumno.
2. **Acceso manual** desde el admin: correo del alumno + producto + vencimiento. El vencimiento es obligatorio de elegir:
   una fecha concreta en la que se revoca, o "no se revoca" explícito. Nunca un default silencioso.
3. **Revocación** manual con un botón, y automática al pasar `expiresAt`.

## Fase 8: verificación y aviso

Antes de avisar, comprueba y reporta cada punto con su resultado real:

- `pnpm build` pasa en los dos repos.
- El backend conecta a Atlas y `/api/health` responde.
- Login como admin y como alumno demo funcionan.
- Un producto cargado desde Drive se ve en el catálogo y su video reproduce con el acceso del alumno demo.
- El flujo de pago llega hasta la Cajita (el cobro real depende de que el dominio esté registrado en Payphone Developer).
- `grep` de grid vacío; ningún `.vue` pasa de 300 líneas; `git status` limpio en ambos repos; `.env` sin versionar.

El mensaje final incluye: rutas de los repos, URL local, credenciales del admin y del alumno demo (el usuario las
necesita para entrar), qué quedó cargado, y la lista de **pendientes del lado del cliente**: dominio y URL de respuesta
en Payphone Developer, llave de Token Authentication de Bunny, dominio verificado en Resend, contenido faltante.

## Orquestación con subagentes

Tú coordinas; los subagentes ejecutan. Lanza en paralelo solo trabajo que no comparta archivos:

| Momento | Agentes en paralelo |
|---|---|
| Tras la Fase 3 | uno para el backend (modelos + servicios + rutas) y uno para el frontend público (home, catálogo, detalle, auth) |
| Con el API estable | uno para checkout + área de alumno, uno para el panel admin, uno para el inventario del Drive |
| Al final | uno para la carga de contenido, uno para la revisión mobile y la regla de no-grid |

A cada subagente dale: la ruta del repo, la orden de leer su `CLAUDE.md`, las reglas duras de esta skill, la lista
exacta de archivos que le tocan y el contrato del API (rutas, payloads, respuestas). No le pases secretos: el código
los lee de `env.ts`.

Dos agentes pueden trabajar en el mismo repo solo si sus archivos no se pisan. Cada uno commitea únicamente lo suyo
con `git add <archivo>` y `git commit -m "..." -- <archivo>`. Si aparece `index.lock`, espera y reintenta; no lo borres.
