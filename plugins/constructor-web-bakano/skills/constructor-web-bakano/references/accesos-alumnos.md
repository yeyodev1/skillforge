# Accesos: alumno demo, acceso manual y revocación

Un solo modelo resuelve la compra, el regalo manual y la cuenta demo. Así el reproductor pregunta una sola cosa:
"¿este usuario tiene un acceso vigente a este producto?".

## Modelo `access`

```ts
{
  user: ObjectId,             // ref User
  product: ObjectId,          // ref Product
  source: "purchase" | "manual" | "demo",
  order: ObjectId | null,     // solo en compras
  grantedBy: ObjectId | null, // admin que lo otorgó, solo en manuales
  note: string,               // motivo: "alumna de la cohorte 2025", "canje", "cortesía"
  expiresAt: Date | null,     // null = no se revoca
  revokedAt: Date | null,     // revocación manual
  createdAt, updatedAt
}
```

Índice único `{ user, product }`. Volver a otorgar actualiza el registro existente y limpia `revokedAt`.

**Vigente** significa `revokedAt === null && (expiresAt === null || expiresAt > ahora)`. Esa condición vive en una sola
función de `access.service.ts` y la usan el middleware del reproductor, "Mis cursos" y el panel admin. No la repitas
en controllers ni en el frontend.

## Alumno demo

- Script `src/scripts/seed-student.ts` + `"seed:student"` en `package.json`, con la misma forma que `seed-admin.ts`
  de la plantilla.
- Lee `DEMO_STUDENT_EMAIL` y `DEMO_STUDENT_PASSWORD` del `.env`. Sin contraseña no crea nada.
- Crea el usuario con `accountType` de alumno y un `access` con `source: "demo"` y `expiresAt: null` para cada
  producto existente. Es idempotente, y se vuelve a correr después de cargar el contenido para cubrir los productos nuevos.
- Las credenciales van en el reporte final: el usuario y su cliente las usan para ver la plataforma "como alumno".

## Acceso manual desde el admin

Formulario en el panel (vista de alumnos o de producto), pensado para usarse desde el celular:

1. **Correo del alumno.** Si el usuario no existe, se crea con contraseña temporal y recibe un correo para definirla.
2. **Producto o productos** (selección múltiple).
3. **Vencimiento — obligatorio elegir una de dos opciones, sin valor preseleccionado:**
   - "Se revoca el…" con selector de fecha.
   - "No se revoca".
4. **Nota** opcional.

El backend rechaza la petición si no llega `expiresAt` como fecha válida futura o como `null` explícito. La razón: un
default silencioso termina regalando acceso de por vida, o cortándolo, sin que nadie lo haya decidido.

Al otorgar se envía un correo al alumno indicando qué recibió y **hasta cuándo**: "Tu acceso está activo hasta el 30
de noviembre de 2026" o "Tu acceso no tiene fecha de vencimiento".

Rutas bajo `authMiddleware` + `adminMiddleware`:

```
POST   /api/admin/access              { email, productIds, expiresAt, note }
GET    /api/admin/access?product=&user=&status=vigente|vencido|revocado
PATCH  /api/admin/access/:id          { expiresAt }   cambiar o quitar el vencimiento
POST   /api/admin/access/:id/revoke   revocar ahora
```

La tabla del admin muestra por fila: alumno, producto, origen, estado, vence (fecha o "No se revoca") y las acciones
revocar y editar vencimiento. En móvil cada fila se convierte en una tarjeta apilada con flex; nada de tablas con
scroll horizontal.

## Revocación

- **Manual:** marca `revokedAt`. No se borra el documento: el historial sirve para soporte.
- **Automática:** no hace falta un cron para cortar el acceso, porque "vigente" se evalúa en cada petición. El cron
  (`--cron` en create-backapp) sirve para **avisar**: un correo siete días antes y otro el día del vencimiento.
- En el área del alumno, un acceso con vencimiento muestra "Disponible hasta el …". Uno vencido aparece bloqueado con
  el botón para volver a comprar, no desaparece: que el curso se esfume sin explicación genera tickets de soporte.

## Compras

Al confirmarse un pago (`references/payphone.md`) se crea el `access` con `source: "purchase"` y el `expiresAt` que
defina el producto: `accessDurationDays` en el modelo `product`, donde `null` significa de por vida. Pregunta ese dato
si el brief no lo dice; mientras tanto el default es de por vida, y se anota en el reporte final.
