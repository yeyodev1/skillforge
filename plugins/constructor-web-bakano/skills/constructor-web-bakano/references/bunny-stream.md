# Bunny Stream: subida y entrega de videos

API base: `https://video.bunnycdn.com`. Todas las llamadas llevan el header `AccessKey: <BUNNY_STREAM_API_KEY>`
(la key de la *librería*, no la de la cuenta). La key de solo lectura sirve para listar; la de cuenta solo hace falta
para administrar librerías o zonas y casi nunca se usa.

## Subir un video

```ts
// 1. Crear el objeto de video (opcionalmente dentro de una colección)
const { data } = await axios.post(
  `https://video.bunnycdn.com/library/${env.BUNNY_LIBRARY_ID}/videos`,
  { title, collectionId },
  { headers: { AccessKey: env.BUNNY_STREAM_API_KEY } },
);

// 2. Subir el binario al guid devuelto
await axios.put(
  `https://video.bunnycdn.com/library/${env.BUNNY_LIBRARY_ID}/videos/${data.guid}`,
  fs.createReadStream(filePath),
  {
    headers: { AccessKey: env.BUNNY_STREAM_API_KEY, "Content-Type": "application/octet-stream" },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  },
);
```

- **Colecciones:** `POST /library/{id}/collections` con `{ name }`. Una colección por curso mantiene ordenada la librería.
- **Desde una URL pública:** `POST /library/{id}/videos/fetch` con `{ url, title }`; Bunny lo descarga solo.
- **Estado:** `GET /library/{id}/videos/{guid}` → `status`: 0 creado, 1 subido, 2 procesando, 3 transcodificando,
  4 listo, 5 error, 6 falló la subida. La lección se publica cuando llega a 4; el mismo GET devuelve `length` (segundos).
- **Miniatura:** `https://<BUNNY_CDN_HOSTNAME>/<guid>/thumbnail.jpg`.

### Subida desde el panel admin

Vercel corta los cuerpos de petición a unos pocos MB, así que un video **no puede pasar por el backend**. El flujo es:
el backend crea el objeto de video y devuelve al admin una firma para subida directa por TUS
(`https://video.bunnycdn.com/tusupload`), con estos headers:

```
AuthorizationSignature = sha256(library_id + api_key + expiration_time + video_id)
AuthorizationExpire    = expiration_time (unix, segundos)
VideoId, LibraryId
```

El navegador sube directo a Bunny con `tus-js-client` y la API key nunca sale del servidor. Las cargas masivas
iniciales se hacen con un script local de Node, que no tiene ese límite.

## Reproducir

```
https://iframe.mediadelivery.net/embed/<libraryId>/<videoId>?token=<token>&expires=<unix>
```

Con **Token Authentication** activado en la librería (Security → Embed view token authentication):

```ts
const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 4;
const token = crypto
  .createHash("sha256")
  .update(env.BUNNY_TOKEN_AUTH_KEY + videoId + expires)
  .digest("hex");
```

- La llave de Token Authentication es distinta de las API keys y se copia desde esa misma pantalla de seguridad.
  Si el usuario no la pasó, pídela y déjala como pendiente: sin ella el embed funciona, pero cualquiera con el enlace
  ve el video, y en un curso pago eso no es aceptable para producción.
- El backend expone `GET /api/lessons/:id/playback`: valida el acceso del usuario a ese producto y devuelve la URL
  firmada. El frontend nunca construye URLs de Bunny por su cuenta ni guarda el `videoId` fuera de esa respuesta.
- Las lecciones con `isFreePreview` devuelven la URL sin exigir acceso.
- En la misma pantalla de seguridad conviene limitar los *Allowed referrers* a los dominios del proyecto.
- El iframe va en un contenedor con `aspect-ratio: 16 / 9` y `width: 100%`; así funciona en móvil sin grid ni trucos de padding.
