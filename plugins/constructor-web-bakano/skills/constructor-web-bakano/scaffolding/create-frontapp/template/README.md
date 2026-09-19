# __TITLE__ — frontapp

Vue 3 + Vite + TypeScript + SCSS + Pinia + vue-router. Se despliega en Vercel como SPA.

## Setup local

```bash
__PM_INSTALL__
cp .env.example .env        # VITE_API_BASE_URL apunta al backapp local
__PM_RUN__ dev                    # http://localhost:5173
```

Necesita el backapp corriendo en `:__API_PORT__`.

## Scripts

| Script | Qué hace |
|---|---|
| `__PM_RUN__ dev` | servidor de desarrollo |
| `__PM_RUN__ build` | `vue-tsc -b && vite build` (el type-check corre acá) |
| `__PM_RUN__ preview` | sirve `dist/` |
| `__PM_RUN__ typecheck` | solo vue-tsc |
| `__PM_RUN__ format` | prettier |

## Estructura

```
src/
  components/ui/   piezas sin dominio (ToastList, BaseModal…)
  components/<x>/  piezas por feature
  composables/     lógica compartida (useX.ts)
  config/          copy y configuración estática (site.ts)
  layout/          TheHeader, TheFooter y shells de página
  router/          rutas lazy + títulos + guards
  services/        httpBase.ts (APIBase) + <x>.service.ts
  stores/          Pinia (user, toast)
  styles/          index.scss (tokens inyectados) · global.scss (CSS real)
  types/           interfaces del dominio
  views/           XView.vue — solo componen
```

## Estilos

`vite.config.ts` inyecta `src/styles/index.scss` al inicio de **cada** `<style lang="scss">`.
Por eso ahí solo hay variables, funciones y mixins. Todo lo que emite CSS (reset, `:root`,
`body`, `.btn`, transiciones) vive en `global.scss`, importado una vez desde `main.ts`.

En los componentes se usan `$variables` y `@include mixin` directamente, sin `@use`.

## Deploy a Vercel

`vercel.json` reescribe todo a `index.html` y cachea `/assets` como inmutable.

```bash
vercel --prod
```
