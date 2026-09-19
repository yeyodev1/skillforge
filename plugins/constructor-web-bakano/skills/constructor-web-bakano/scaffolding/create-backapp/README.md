# create-backapp

Scaffolding Bakano: Express 5 + Mongoose + TypeScript, desplegable en Vercel. Sin dependencias, solo Node >= 20.

```bash
npx create-backapp <nombre>
```

Agrega el sufijo si no viene, pregunta lo mínimo (o `-y` para defaults), crea el `.env`,
hace `git init`, instala con pnpm (o `--pm npm`) y deja el primer commit.

## Flags

```
--port <n>        puerto local (8100)
--domain <host>   dominio de producción para CORS
--uploads         multer + cloudinary
--cron            ruta /api/cron protegida con CRON_SECRET
--pm <pnpm|npm>   gestor de paquetes
--no-install      no instala dependencias
--no-git          no inicializa git
-y, --yes         sin preguntas
```
