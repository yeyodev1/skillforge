# Cargar el contenido del cliente desde Google Drive

El cliente entrega una carpeta de Drive con fotos, videos, PDFs y descripciones, casi siempre desordenada. El trabajo
es convertirla en productos publicables sin inventar nada.

## 1. Inventario

Con el MCP de Drive (`search_files` filtrando por la carpeta como padre, recursivo; `get_file_metadata` para tamaño y
tipo) arma una tabla: ruta, nombre, tipo MIME, tamaño. Lee los Docs, Sheets y PDFs de texto con `read_file_content`:
ahí suelen estar títulos, descripciones, temarios y precios.

Si la carpeta no abre, no está compartida con la cuenta conectada al MCP. Pide al usuario que la comparta con ese
correo y sigue con el resto.

## 2. Mapeo

Propón la estructura antes de subir nada:

```
Carpeta "Curso Finanzas desde cero"   → product (type: course)
  ├─ "Módulo 1 - Presupuesto"         → module (order 1)
  │    ├─ 01 intro.mp4                → lesson (order 1) → Bunny
  │    └─ plantilla.xlsx              → adjunto de la lección → Cloudinary (raw)
  ├─ portada.jpg                      → product.cover → Cloudinary
  └─ descripcion.docx                 → product.description
"Ebook Ahorro.pdf"                    → product (type: download)
```

- El orden sale de los prefijos numéricos de los nombres; si no hay, alfabético, y se anota como supuesto.
- Títulos limpios: sin extensión, sin prefijo numérico, sin guiones bajos, con mayúsculas corregidas.
- Precios y descripciones: primero el Drive, luego el brief, luego la web de referencia. Si no aparecen en ninguno, el
  producto se crea con `isPublished: false` y va a pendientes. No se inventan.
- Si el mapeo es ambiguo (un video suelto que podría ser de dos cursos), decide con el criterio más razonable, sigue, y
  deja la duda anotada en el reporte final. No frenes la carga completa por un archivo.

## 3. Descarga y subida

- **Imágenes** → Cloudinary, carpeta `<cliente>/productos`. Guarda `secure_url` y `public_id`.
- **PDFs y adjuntos** → Cloudinary con `resource_type: "raw"`. Los descargables de pago no deben quedar con URL pública
  adivinable: súbelos con `type: "authenticated"` y entrégalos con URL firmada desde el backend tras validar el acceso.
- **Videos** → Bunny, una colección por curso (`references/bunny-stream.md`).

Los videos pesados son el punto débil: `download_file_content` del MCP sirve para archivos chicos y medianos. Si un
archivo no baja por ahí, en orden de preferencia:

1. Que el usuario sincronice o descargue la carpeta localmente (Drive para escritorio o `rclone`) y el script sube
   desde disco. Es lo más confiable para cursos completos.
2. El endpoint `fetch` de Bunny con un enlace de descarga directa. Con archivos grandes Drive intercala una página de
   aviso de virus y falla; úsalo solo con archivos chicos y verifica que el `status` llegue a 4.

Nunca marques un video como subido sin consultar su estado en Bunny.

## 4. Script de carga

`src/scripts/import-content.ts` en el backapp, con un `content.manifest.json` al lado que describe el mapeo
(productos, módulos, lecciones, rutas locales o ids de Drive). Requisitos:

- **Idempotente:** busca por `slug` antes de crear y por `bunnyVideoId` antes de volver a subir. Correrlo dos veces no
  duplica nada.
- Usa los services del backend (`cloudinary.service`, `bunny.service`), no llamadas sueltas duplicadas.
- Deja un log por archivo: `ok`, `omitido (ya existe)` o `falló: <motivo>`.
- El manifest se commitea (no lleva secretos); los binarios descargados no: agrega `tmp/` y `content/` a `.gitignore`.

## 5. Verificación

Cuenta productos, módulos y lecciones creados contra el inventario. Abre un curso como alumno demo y reproduce la
primera y la última lección. Reporta lo que faltó y por qué.
