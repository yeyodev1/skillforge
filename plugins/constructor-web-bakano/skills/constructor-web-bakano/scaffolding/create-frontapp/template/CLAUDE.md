# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es esto

Frontend de __TITLE__. Vue 3 + Vite + TypeScript, SCSS propio, Pinia, vue-router.
Desplegado en Vercel. El backend vive en el repo hermano `*-backapp` (Express 5 + Mongoose).

## Comandos

```sh
__PM_INSTALL__
__PM_RUN__ dev          # :5173 — necesita el backapp en :__API_PORT__
__PM_RUN__ build        # vue-tsc -b && vite build (el type-check corre acá)
__PM_RUN__ typecheck
__PM_RUN__ format
```

No hay suite de tests. La verificación es `__PM_RUN__ build` + revisión en navegador.
Si vite sirve código viejo tras un cambio grande: `rm -rf node_modules/.vite && __PM_RUN__ dev --force`.

## Reglas duras

- **Ningún `.vue` pasa de 300 líneas** (SFC entero). La salida no es partirlo en dos de 290:
  es sacar la lógica a un composable y dejar un componente que solo compone.
- **Layout con flexbox.** Para "grillas" usar el mixin `flex-cards($basis, $gap)`.
- **Nada de librerías UI ni Tailwind.** SCSS propio con los tokens de `src/styles/`.
- **Iconos con Font Awesome por CDN** (`<i class="fa-solid fa-…">`). Sin emojis en la UI.
- **El copy vive en `src/config/site.ts`**, no dentro de los componentes.
- Todo `VITE_*` queda expuesto en el navegador: nunca un secreto con ese prefijo.

## Estilos: la trampa de `additionalData`

`vite.config.ts` antepone `@/styles/index.scss` a **cada** bloque `<style lang="scss">`.
Por eso `index.scss` solo puede contener cosas que **no emiten CSS**: variables, `@forward`,
funciones y mixins. Un solo selector ahí se duplica en el CSS de todos los componentes.

Todo lo que emite CSS (reset, `html`/`body`, custom properties, `.btn`, transiciones) va en
`global.scss`, importado una única vez desde `main.ts`. Las fuentes se cargan con `<link>`
en `index.html`.

En componentes: `$ink`, `$accent`, `@include from('md')`, `@include container` — sin `@use`.

## Arquitectura

- **Routes** (`src/router/index.ts`) — lazy imports, `meta.title`, `meta.requiresAuth`; el
  título se aplica en `afterEach`.
- **Services** (`src/services/`) — `class XService extends APIBase`, `export const xService`.
  `httpBase.ts` resuelve la URL del API (env → localhost → túnel `-front`/`-back` → prod),
  pone el Bearer de `localStorage.access_token` y emite `auth:token-expired` en 401.
- **Stores** (`src/stores/`) — Pinia options API. `user.ts` guarda la sesión y `restore()`
  la verifica contra `/auth/me` al arrancar.
- **Composables** — estado de módulo (`ref` fuera de la función) para estado UI compartido.
- **Errores del API** — siempre `{ status, message, data? }` (`ApiError`); el `message` viene
  en español desde el backend y se puede mostrar tal cual en un toast.

## Convenciones

- `<script setup lang="ts">` siempre; orden script → template → style; `<style scoped lang="scss">`.
- Sin punto y coma, comillas simples, 2 espacios (Prettier).
- Componentes PascalCase; singletons de layout con prefijo `The`; vistas con sufijo `View`.
- BEM en clases: `.header__nav`, `.btn--primary`.
- Comentarios y copy en español; explican el porqué, no el qué.
