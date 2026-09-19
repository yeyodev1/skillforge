# create-frontapp

Scaffolding Bakano: Vue 3 + Vite + TypeScript + SCSS + Pinia + vue-router, desplegable en Vercel. Sin dependencias, solo Node >= 20.

```bash
npx create-frontapp <nombre>
```

Agrega el sufijo si no viene, pregunta lo mínimo (o `-y` para defaults), crea el `.env`,
hace `git init`, instala con pnpm (o `--pm npm`) y deja el primer commit.

## Flags

```
--api-port <n>    puerto del backapp local (8100)
--domain <host>   dominio de producción
--color <hex>     color de acento de la marca
--title <texto>   nombre visible de la marca
--gsap            agrega gsap
--eslint          ESLint con regla de 300 líneas por .vue
--pm <pnpm|npm>   gestor de paquetes
--no-install      no instala dependencias
--no-git          no inicializa git
-y, --yes         sin preguntas
```
