#!/usr/bin/env node
// create-backapp — genera un backapp Bakano: Express 5 + Mongoose + TypeScript
// desplegable en Vercel. Sin dependencias: solo Node >= 20.
//
// Uso:
//   npx create-backapp <nombre> [opciones]
//
// Opciones:
//   --pm <pnpm|npm>     gestor de paquetes (default: pnpm si está instalado)
//   --port <n>          puerto local (default: 8100)
//   --domain <host>     dominio de producción para CORS (ej: perfumstudio.com)
//   --uploads           agrega multer + cloudinary (subida de archivos)
//   --cron              agrega ruta /api/cron protegida con CRON_SECRET
//   --no-install        no instala dependencias
//   --no-git            no inicializa git
//   -y, --yes           no pregunta nada, usa defaults
//   -h, --help          esta ayuda

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.join(PKG_ROOT, "template");
const EXTRAS_DIR = path.join(PKG_ROOT, "extras");

const SUFFIX = "-backapp";
const DEFAULT_PORT = 8100;

// Archivos que npm no publica con su nombre real: se guardan con "_" y se renombran.
const RENAMES = {
  _gitignore: ".gitignore",
  _npmrc: ".npmrc",
  "_env.example": ".env.example",
  "_prettierrc.json": ".prettierrc.json",
};

// ─── Dependencias ─────────────────────────────────────────────────────────────

const DEPS = {
  axios: "^1.7.9",
  bcryptjs: "^3.0.3",
  cors: "^2.8.5",
  dotenv: "^16.4.7",
  express: "^5.1.0",
  jsonwebtoken: "^9.0.2",
  mongoose: "^8.9.5",
  resend: "^6.20.0",
};

const DEV_DEPS = {
  "@types/cors": "^2.8.17",
  "@types/express": "^5.0.0",
  "@types/jsonwebtoken": "^9.0.7",
  "@types/node": "^22.10.5",
  prettier: "^3.6.2",
  "ts-node-dev": "^2.0.0",
  typescript: "^5.7.3",
};

const EXTRA_DEPS = {
  uploads: { deps: { cloudinary: "^2.10.0", multer: "^2.1.1" }, devDeps: { "@types/multer": "^2.1.0" } },
  cron: { deps: {}, devDeps: {} },
};

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    name: "",
    pm: "",
    port: DEFAULT_PORT,
    domain: "",
    uploads: false,
    cron: false,
    install: true,
    git: true,
    yes: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "-y" || a === "--yes") opts.yes = true;
    else if (a === "--uploads") opts.uploads = true;
    else if (a === "--cron") opts.cron = true;
    else if (a === "--no-install") opts.install = false;
    else if (a === "--no-git") opts.git = false;
    else if (a === "--pm") opts.pm = argv[++i] || "";
    else if (a.startsWith("--pm=")) opts.pm = a.slice(5);
    else if (a === "--port") opts.port = Number(argv[++i]);
    else if (a.startsWith("--port=")) opts.port = Number(a.slice(7));
    else if (a === "--domain") opts.domain = argv[++i] || "";
    else if (a.startsWith("--domain=")) opts.domain = a.slice(9);
    else if (a.startsWith("-")) fail(`Opción desconocida: ${a}`);
    else if (!opts.name) opts.name = a;
    else fail(`Argumento inesperado: ${a}`);
  }
  return opts;
}

function help() {
  const src = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
  const lines = src.split("\n").slice(1).filter((l) => l.startsWith("//"));
  console.log(lines.map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
}

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

function has(cmd) {
  const r = spawnSync(cmd, ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
  return r.status === 0;
}

function detectPm() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("npm")) return has("pnpm") ? "pnpm" : "npm";
  return has("pnpm") ? "pnpm" : "npm";
}

function normalizeName(raw) {
  let n = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!n) return "";
  if (!n.endsWith(SUFFIX)) n += SUFFIX;
  return n;
}

function titleFrom(name) {
  return name
    .replace(new RegExp(`${SUFFIX}$`), "")
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

async function ask(rl, q, def = "") {
  const suffix = def ? ` (${def})` : "";
  const a = (await rl.question(`  ${q}${suffix}: `)).trim();
  return a || def;
}

async function confirm(rl, q, def = false) {
  const hint = def ? "S/n" : "s/N";
  const a = (await rl.question(`  ${q} [${hint}]: `)).trim().toLowerCase();
  if (!a) return def;
  return a === "s" || a === "si" || a === "sí" || a === "y" || a === "yes";
}

async function interactive(opts) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    if (!opts.name) opts.name = await ask(rl, "Nombre del proyecto (se agrega -backapp)");
    if (!opts.name) fail("Necesito un nombre.");
    if (!opts.domain) opts.domain = await ask(rl, "Dominio de producción (opcional, ej: cliente.com)");
    const port = await ask(rl, "Puerto local", String(opts.port));
    opts.port = Number(port) || DEFAULT_PORT;
    opts.pm = await ask(rl, "Gestor de paquetes (pnpm/npm)", opts.pm || detectPm());
    if (!opts.uploads) opts.uploads = await confirm(rl, "¿Subida de archivos (multer + cloudinary)?", false);
    if (!opts.cron) opts.cron = await confirm(rl, "¿Ruta de cron para Vercel (CRON_SECRET)?", false);
  } finally {
    rl.close();
  }
}

// ─── Copia de plantilla ───────────────────────────────────────────────────────

function isTextFile(file) {
  return !/\.(png|jpg|jpeg|webp|gif|ico|woff2?|ttf|otf|pdf)$/i.test(file);
}

function render(content, vars) {
  return content.replace(/__([A-Z_]+)__/g, (m, key) => (key in vars ? vars[key] : m));
}

function copyDir(src, dest, vars) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const outName = RENAMES[entry.name] || entry.name;
    const to = path.join(dest, outName);
    if (entry.isDirectory()) {
      copyDir(from, to, vars);
    } else if (isTextFile(entry.name)) {
      fs.writeFileSync(to, render(fs.readFileSync(from, "utf8"), vars));
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function insertAfterMarker(file, marker, text) {
  const src = fs.readFileSync(file, "utf8");
  if (!src.includes(marker)) return;
  fs.writeFileSync(file, src.replace(marker, `${marker}\n${text}`));
}

function stripMarkers(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      stripMarkers(p);
    } else if (/\.(ts|json|md|example)$/.test(entry.name) || entry.name === ".env") {
      const src = fs.readFileSync(p, "utf8");
      const out = src
        .split("\n")
        .filter((l) => !/^\s*(\/\/|#)\s*@@[a-z-]+@@\s*$/.test(l))
        .join("\n");
      if (out !== src) fs.writeFileSync(p, out);
    }
  }
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  return r.status === 0;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return help();

  console.log("\n  create-backapp · Express 5 + Mongoose + TypeScript → Vercel\n");

  if (!opts.yes) await interactive(opts);
  if (!opts.name) fail("Necesito un nombre: npx create-backapp <nombre>");

  const name = normalizeName(opts.name);
  const title = titleFrom(name);
  const pm = opts.pm === "npm" ? "npm" : "pnpm";
  const port = Number.isInteger(opts.port) && opts.port > 0 ? opts.port : DEFAULT_PORT;
  const domain = opts.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const target = path.resolve(process.cwd(), name);

  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    fail(`La carpeta ${name} ya existe y no está vacía.`);
  }
  if (pm === "pnpm" && !has("pnpm")) fail("pnpm no está instalado. Usa --pm npm o instala pnpm.");

  const prodOrigins = domain ? `"https://${domain}",\n  "https://www.${domain}",` : `// "https://cliente.com",\n  // "https://www.cliente.com",`;

  const vars = {
    NAME: name,
    TITLE: title,
    PORT: String(port),
    DOMAIN: domain || "cliente.com",
    PROD_ORIGINS: prodOrigins,
    PM: pm,
    PM_RUN: pm === "npm" ? "npm run" : "pnpm",
    PM_INSTALL: pm === "npm" ? "npm install" : "pnpm install",
    DB_NAME: name.replace(new RegExp(`${SUFFIX}$`), ""),
  };

  console.log(`  → Creando ${name} en ${target}\n`);
  copyDir(TEMPLATE_DIR, target, vars);

  // Extras opcionales: se copian encima y se enganchan en routes/index.ts y .env.example
  const routesIndex = path.join(target, "src/routes/index.ts");
  const envExample = path.join(target, ".env.example");
  const deps = { ...DEPS };
  const devDeps = { ...DEV_DEPS };

  if (opts.uploads) {
    copyDir(path.join(EXTRAS_DIR, "uploads"), target, vars);
    Object.assign(deps, EXTRA_DEPS.uploads.deps);
    Object.assign(devDeps, EXTRA_DEPS.uploads.devDeps);
    insertAfterMarker(
      envExample,
      "# @@extras-env@@",
      "\n# --- Cloudinary ---\nCLOUDINARY_CLOUD_NAME=\nCLOUDINARY_API_KEY=\nCLOUDINARY_API_SECRET=",
    );
  }

  if (opts.cron) {
    copyDir(path.join(EXTRAS_DIR, "cron"), target, vars);
    insertAfterMarker(routesIndex, "// @@extra-imports@@", 'import cronRoutes from "./cron.routes";');
    insertAfterMarker(routesIndex, "  // @@extra-routes@@", '  router.use("/cron", cronRoutes);');
    insertAfterMarker(
      envExample,
      "# @@extras-env@@",
      "\n# --- Vercel Cron ---\n# Vercel manda Authorization: Bearer $CRON_SECRET en cada corrida.\nCRON_SECRET=",
    );
    const vercelPath = path.join(target, "vercel.json");
    const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
    vercel.crons = [{ path: "/api/cron/ping", schedule: "0 * * * *" }];
    fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");
  }

  stripMarkers(target);

  // package.json se arma acá para que las deps queden ordenadas y con las extras.
  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const pkg = {
    name,
    version: "1.0.0",
    private: true,
    description: `API de ${title}. Express 5 + Mongoose + TypeScript, desplegada en Vercel.`,
    main: "dist/index.js",
    engines: { node: ">=20" },
    scripts: {
      dev: "ts-node-dev --respawn --transpile-only src/index.ts",
      build: "tsc",
      compile: "tsc --watch",
      start: "node dist/index.js",
      "seed:admin": "ts-node-dev --transpile-only src/scripts/seed-admin.ts",
      format: "prettier --write 'src/**/*.{ts,json,md}' 'api/**/*.ts'",
    },
    dependencies: sorted(deps),
    devDependencies: sorted(devDeps),
  };
  fs.writeFileSync(path.join(target, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // Con npm el lock de pnpm no debe versionarse (Vercel cambiaría de gestor).
  if (pm === "npm") {
    fs.appendFileSync(
      path.join(target, ".gitignore"),
      "\n# Este proyecto usa npm; un lock de pnpm hace que Vercel cambie de gestor.\npnpm-lock.yaml\n",
    );
  } else {
    fs.appendFileSync(
      path.join(target, ".gitignore"),
      "\n# Este proyecto usa pnpm; un lock de npm hace que Vercel cambie de gestor.\npackage-lock.json\n",
    );
  }

  // .env listo para arrancar en local: JWT generado, Mongo local.
  const envLocal = fs
    .readFileSync(envExample, "utf8")
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${crypto.randomBytes(32).toString("hex")}`)
    .replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${crypto.randomBytes(9).toString("base64url")}`);
  fs.writeFileSync(path.join(target, ".env"), envLocal);

  if (opts.git && has("git")) {
    run("git", ["init", "-q", "-b", "main"], target);
  }

  let installed = false;
  if (opts.install) {
    console.log(`\n  → Instalando dependencias con ${pm}…\n`);
    installed = run(pm, ["install"], target);
    if (!installed) console.warn(`\n  ⚠ La instalación falló. Corre "${vars.PM_INSTALL}" a mano.`);
  }

  if (opts.git && has("git") && installed) {
    run("git", ["add", "-A"], target);
    run("git", ["commit", "-q", "-m", "chore: scaffold inicial con create-backapp"], target);
  }

  const adminPass = envLocal.match(/^ADMIN_PASSWORD=(.*)$/m)?.[1] || "";
  console.log(`
  ✔ Listo: ${name}

  Siguiente:
    cd ${name}${installed ? "" : `\n    ${vars.PM_INSTALL}`}
    ${vars.PM_RUN} dev            # http://localhost:${port}

  Endpoints:
    GET  /                 alive
    GET  /api/health       estado + db
    POST /api/auth/login   { email, password }
    GET  /api/auth/me      Bearer <token>

  Admin sembrado al arrancar (desde .env):
    email     admin@${vars.DOMAIN}
    password  ${adminPass}

  Deploy: vercel --prod  (entrada: api/index.ts, ver vercel.json)
`);
}

main().catch((e) => fail(e?.message || String(e)));
