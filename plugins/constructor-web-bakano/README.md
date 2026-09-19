# 🏗️ constructor-web-bakano

**De las notas de la reunión a la plataforma funcionando.** Pegas el brief del cliente con sus credenciales y Claude levanta el backend y el frontend, crea la base de datos en Atlas, conecta pagos, video, archivos y correo, carga el contenido desde Drive y deja los accesos listos para revisar.

> 🔒 Las credenciales que pegas en el chat solo terminan en el `.env` del backend. Nunca en commits, README ni `.env.example`.

## 📦 Instalación

```
/plugin marketplace add yeyodev1/skillforge
/plugin install constructor-web-bakano@skillforge
```

O descarga el [ZIP desde Releases](https://github.com/yeyodev1/skillforge/releases).

## ✅ Requisitos

| Qué | Para qué |
|---|---|
| Node 20 o superior | Los generadores `create-backapp` y `create-frontapp` **vienen incluidos** en la skill (`scaffolding/`), sin dependencias. Si los tienes enlazados con `npm link`, usa esos |
| MCP de **MongoDB Atlas** con service account | Crear proyecto, cluster, usuario y access list |
| MCP de **Google Drive** | Leer la carpeta de contenido del cliente |
| `pnpm` (o `npm` con `--pm npm`) | Instalar y correr los proyectos |

## 🗣️ Cómo activarlo

- *"Necesitamos hacer una plataforma, harás el back y el front. Estas son las notas de la reunión…"*
- *"Construye la web de [cliente]"*
- *"Arma la tienda de [cliente] con Payphone"*
- *"Crea el proyecto en Mongo y configura el .env"*
- *"Métete a esta carpeta de Drive y sube los cursos como productos"*

## 🧭 Las fases

| # | Fase | Resultado |
|---|---|---|
| 0 | Ficha del brief | Cliente, qué vende, módulos que aplican, dominios, credenciales recibidas y faltantes |
| 1 | Scaffolding | `<cliente>-backapp` y `<cliente>-frontapp` creados con los CLIs, en `main` |
| 2 | MongoDB Atlas | Proyecto, cluster gratuito, usuario, acceso desde cualquier IP y `DB_URI` en el `.env` |
| 3 | Variables de entorno | Todas las credenciales en `.env`; solo los nombres en `.env.example` |
| 4 | Backend | Productos, módulos, lecciones, órdenes, accesos, Payphone, Bunny, Cloudinary, Resend y panel admin |
| 5 | Frontend | Catálogo, checkout con la Cajita de Pagos, área de alumno, reproductor y admin |
| 6 | Contenido | Carpeta de Drive convertida en productos con un script idempotente |
| 7 | Accesos | Alumno demo, acceso manual con o sin vencimiento, revocación |
| 8 | Verificación | Builds, flujo completo probado y lista de pendientes del cliente |

## 📏 Reglas que nunca rompe

- 📱 **Mobile first**: se diseña a 360 px y se escala hacia arriba.
- 🚫 **Cero `display: grid`**: todo el layout es flexbox.
- 🧩 **Un commit por archivo**, en `main`, con mensajes en español.
- 🤖 **Subagentes en paralelo** para backend, frontend, admin y contenido.
- 🔑 **Secretos solo en `.env`**.
- 📐 Máximo 300 líneas por `.vue`, sin librerías UI ni Tailwind.

## 📚 Referencias incluidas

| Archivo | Contenido |
|---|---|
| `references/atlas-mongo.md` | Paso a paso con las tools del MCP de Atlas y sus errores conocidos |
| `references/payphone.md` | Cajita de Pagos v2.0, montos en centavos, confirmación antes de 5 minutos |
| `references/bunny-stream.md` | Subida, colecciones, subida directa por TUS y embeds firmados |
| `references/contenido-drive.md` | Inventario, mapeo a productos y script de carga |
| `references/accesos-alumnos.md` | Modelo de accesos, alumno demo, acceso manual y revocación |
| `scaffolding/` | Copia de `create-backapp` (Express 5 + Mongoose + TS) y `create-frontapp` (Vue 3 + Vite + TS + SCSS) |

## 🧪 Pruebas

En `skills/constructor-web-bakano/evals/evals.json` hay 3 casos: plataforma de cursos completa con credenciales, carga de contenido con accesos, y tienda física con una credencial faltante que no debe bloquear el proyecto.

## 📄 Licencia

MIT © Diego Reyes
