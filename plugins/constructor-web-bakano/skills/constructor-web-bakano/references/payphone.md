# Payphone: Cajita de Pagos

Documentación oficial: https://docs.payphone.app/cajita-de-pagos — si algo de aquí no coincide con lo que ves al
probar, vuelve a leerla: Payphone cambia versiones del CDN sin mucho aviso.

## Cómo funciona

1. El frontend pide al backend crear la orden. El backend calcula el monto, genera el `clientTransactionId` y guarda
   la orden en estado `pending`.
2. El frontend monta la Cajita con esos datos. El usuario paga dentro del formulario de Payphone.
3. Payphone redirige a la **URL de respuesta** con `?id=<int>&clientTransactionId=<string>`.
4. La página de respuesta llama al backend, y el backend confirma contra Payphone. **Si no se confirma en los primeros
   5 minutos, Payphone reversa el cobro automáticamente.** Por eso la confirmación se dispara apenas carga la página,
   sin esperar ningún clic.
5. Con `statusCode: 3` el backend marca la orden como pagada, crea los accesos y envía el correo.

## Frontend

Recursos (cargar una sola vez, desde el composable del checkout, no en `index.html`):

```
https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css
https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js
```

El script es un módulo: se inserta con `<script type="module">`.

```ts
const ppb = new PPaymentButtonBox({
  token,                    // viene del backend junto con la orden
  clientTransactionId,      // único por intento, máximo 50 caracteres
  amount,                   // centavos: $19.90 → 1990
  amountWithoutTax,         // si no se desglosa IVA, igual a amount
  currency: 'USD',
  storeId,
  reference,                // motivo del pago, máximo 100 caracteres
  lang: 'es',
  defaultMethod: 'card',
  timeZone: -5,
  email,                    // datos reales del comprador, nunca fijos
})
ppb.render('pp-button')     // <div id="pp-button"></div> debe existir en el DOM
```

Reglas:

- **Todos los montos son enteros en centavos** y
  `amount = amountWithoutTax + amountWithTax + tax + service + tip`. Si la suma no cuadra, la Cajita falla.
- El formulario vence a los **10 minutos**. Si expira, se crea una orden nueva con otro `clientTransactionId`.
- `email`, `phoneNumber` y `documentId` deben ser los del comprador en cada transacción. Payphone rechaza y puede
  bloquear la cuenta si detecta datos quemados en el código.
- **Estilos propios:** el contenedor, el título, el resumen del pedido y los estados de carga y error son nuestros, en
  SCSS con los tokens del proyecto. El interior del formulario es de Payphone; se ajusta sobrescribiendo sus clases
  desde `global.scss` con moderación (ancho completo en móvil, radios, fuente). No lo metas en un iframe propio.
- Declara `PPaymentButtonBox` en `env.d.ts` para que TypeScript no se queje.

## Backend

`payphone.service.ts`:

```ts
const { data } = await axios.post(
  "https://paymentbox.payphonetodoesposible.com/api/confirm",
  { id: Number(id), clientTxId: clientTransactionId },
  { headers: { Authorization: `Bearer ${env.PAYPHONE_TOKEN}` } },
);
```

- `statusCode === 3` → `Approved`. `statusCode === 2` → `Canceled`. Un error llega como `{ message, errorCode }`.
- Antes de dar acceso, compara `data.amount` con el total de la orden guardada. Si no coinciden, no se entrega nada.
- La confirmación es **idempotente**: si la orden ya está `paid`, responde lo mismo sin duplicar accesos ni correos
  (el usuario recarga la página de respuesta más de lo que uno cree).
- Guarda la respuesta completa de Payphone en la orden: sirve para soporte y conciliación.

Rutas sugeridas: `POST /api/orders` (crea la orden y devuelve la configuración de la Cajita) y
`POST /api/orders/confirm` (recibe `id` y `clientTransactionId`).

El token de la Cajita termina en el navegador por diseño de Payphone. Aun así entrégalo desde el backend junto con la
orden, en lugar de quemarlo en una variable `VITE_*`: así rotarlo no exige redeploy del frontend.

## Configuración que hace el dueño de la cuenta

La Cajita solo funciona en el dominio registrado en Payphone Developer. En la aplicación tipo **WEB** deben estar:

- **Dominio web:** el dominio exacto desde donde se paga (el de preview mientras se prueba, luego el de producción).
- **URL de respuesta:** `https://<dominio>/pago/respuesta`.

Sin eso aparece un error de autorización aunque el código esté bien. En producción se exige HTTPS; `localhost` puede
ir con `http`. Si sale "Access Denied", el sitio debe enviar `Referrer-Policy: origin-when-cross-origin`
(se agrega en los `headers` de `vercel.json` del frontapp).

Esto va siempre en la lista de pendientes del reporte final.
