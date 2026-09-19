#!/usr/bin/env node
// create-frontapp — genera un frontapp Bakano: Vue 3 + Vite + TypeScript + SCSS
// + Pinia + vue-router, desplegable en Vercel. Sin dependencias: solo Node >= 20.
//
// Uso:
//   npx create-frontapp <nombre> [opciones]
//
// Opciones:
//   --pm <pnpm|npm>       gestor de paquetes (default: pnpm si está instalado)
//   --api-port <n>        puerto del backapp local para VITE_API_BASE_URL (default: 8100)
//   --domain <host>       dominio de producción (ej: cliente.com) para meta tags y API
//   --color <hex>         color de acento de la marca (default: #e6285c)
//   --title <texto>       nombre visible de la marca (default: derivado del nombre)
//   --gsap                agrega gsap
//   --eslint              agrega ESLint (flat config, regla de 300 líneas por .vue)
//   --no-install          no instala dependencias
//   --no-git              no inicializa git
//   -y, --yes             no pregunta nada, usa defaults
//   -h, --help            esta ayuda

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");
const TEMPLATE_DIR = path.join(PKG_ROOT, "template");
const EXTRAS_DIR = path.join(PKG_ROOT, "extras");

const SUFFIX = "-frontapp";
const KNOWN_SUFFIXES = ["-frontapp", "-landing", "-webpage", "-frontend", "-web"];
const DEFAULT_API_PORT = 8100;
const DEFAULT_COLOR = "#e6285c";

const RENAMES = {
  _gitignore: ".gitignore",
  _npmrc: ".npmrc",
  "_env.example": ".env.example",
  "_prettierrc.json": ".prettierrc.json",
  _prettierignore: ".prettierignore",
};

// ─── Dependencias ─────────────────────────────────────────────────────────────

const DEPS = {
  axios: "^1.13.2",
  pinia: "^3.0.2",
  vue: "^3.5.13",
  "vue-router": "^4.6.0",
};

const DEV_DEPS = {
  "@types/node": "^22.10.5",
  "@vitejs/plugin-vue": "^6.0.0",
  "@vue/tsconfig": "^0.8.1",
  prettier: "^3.6.2",
  sass: "^1.95.0",
  typescript: "~5.9.3",
  vite: "^7.0.0",
  "vue-tsc": "^3.1.0",
};

const EXTRA_DEPS = {
  gsap: { deps: { gsap: "^3.15.0" }, devDeps: {} },
  eslint: {
    deps: {},
    devDeps: {
      "@eslint/js": "^9.18.0",
      "@vue/eslint-config-typescript": "^14.3.0",
      eslint: "^9.18.0",
      "eslint-plugin-vue": "^9.32.0",
    },
  },
};

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    name: "",
    pm: "",
    apiPort: DEFAULT_API_PORT,
    domain: "",
    color: "",
    title: "",
    gsap: false,
    eslint: false,
    install: true,
    git: true,
    yes: false,
    help: false,
  };
  const take = (i) => argv[++i.v] || "";
  for (const i = { v: 0 }; i.v < argv.length; i.v++) {
    const a = argv[i.v];
    if (a === "-h" || a === "--help") opts.help = true;
    else if (a === "-y" || a === "--yes") opts.yes = true;
    else if (a === "--gsap") opts.gsap = true;
    else if (a === "--eslint") opts.eslint = true;
    else if (a === "--no-install") opts.install = false;
    else if (a === "--no-git") opts.git = false;
    else if (a === "--pm") opts.pm = take(i);
    else if (a.startsWith("--pm=")) opts.pm = a.slice(5);
    else if (a === "--api-port") opts.apiPort = Number(take(i));
    else if (a.startsWith("--api-port=")) opts.apiPort = Number(a.slice(11));
    else if (a === "--domain") opts.domain = take(i);
    else if (a.startsWith("--domain=")) opts.domain = a.slice(9);
    else if (a === "--color") opts.color = take(i);
    else if (a.startsWith("--color=")) opts.color = a.slice(8);
    else if (a === "--title") opts.title = take(i);
    else if (a.startsWith("--title=")) opts.title = a.slice(8);
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
  if (!KNOWN_SUFFIXES.some((s) => n.endsWith(s))) n += SUFFIX;
  return n;
}

function titleFrom(name) {
  let base = name;
  for (const s of KNOWN_SUFFIXES) {
    if (base.endsWith(s)) {
      base = base.slice(0, -s.length);
      break;
    }
  }
  return base
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeColor(raw) {
  const c = raw.trim().replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(c)) return `#${c.toLowerCase()}`;
  if (/^[0-9a-f]{3}$/i.test(c)) return `#${c.toLowerCase().split("").map((x) => x + x).join("")}`;
  return "";
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
    if (!opts.name) opts.name = await ask(rl, "Nombre del proyecto (se agrega -frontapp)");
    if (!opts.name) fail("Necesito un nombre.");
    if (!opts.title) opts.title = await ask(rl, "Nombre visible de la marca", titleFrom(normalizeName(opts.name)));
    if (!opts.domain) opts.domain = await ask(rl, "Dominio de producción (opcional, ej: cliente.com)");
    if (!opts.color) opts.color = await ask(rl, "Color de acento (hex)", DEFAULT_COLOR);
    const apiPort = await ask(rl, "Puerto del backapp local", String(opts.apiPort));
    opts.apiPort = Number(apiPort) || DEFAULT_API_PORT;
    opts.pm = await ask(rl, "Gestor de paquetes (pnpm/npm)", opts.pm || detectPm());
    if (!opts.gsap) opts.gsap = await confirm(rl, "¿Agregar gsap?", false);
    if (!opts.eslint) opts.eslint = await confirm(rl, "¿Agregar ESLint (regla de 300 líneas)?", false);
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

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  return r.status === 0;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return help();

  console.log("\n  create-frontapp · Vue 3 + Vite + TypeScript + SCSS → Vercel\n");

  if (!opts.yes) await interactive(opts);
  if (!opts.name) fail("Necesito un nombre: npx create-frontapp <nombre>");

  const name = normalizeName(opts.name);
  const title = opts.title.trim() || titleFrom(name);
  const pm = opts.pm === "npm" ? "npm" : "pnpm";
  const apiPort = Number.isInteger(opts.apiPort) && opts.apiPort > 0 ? opts.apiPort : DEFAULT_API_PORT;
  const domain = opts.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const color = normalizeColor(opts.color || DEFAULT_COLOR) || DEFAULT_COLOR;
  const target = path.resolve(process.cwd(), name);

  if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
    fail(`La carpeta ${name} ya existe y no está vacía.`);
  }
  if (pm === "pnpm" && !has("pnpm")) fail("pnpm no está instalado. Usa --pm npm o instala pnpm.");

  const vars = {
    NAME: name,
    TITLE: title,
    DOMAIN: domain || "cliente.com",
    SITE_URL: domain ? `https://${domain}` : "https://cliente.com",
    API_PROD_URL: domain ? `https://api.${domain}/api` : "https://api.cliente.com/api",
    API_PORT: String(apiPort),
    ACCENT: color,
    PM: pm,
    PM_RUN: pm === "npm" ? "npm run" : "pnpm",
    PM_INSTALL: pm === "npm" ? "npm install" : "pnpm install",
    FONT_DISPLAY: "Fraunces",
    FONT_BODY: "Montserrat",
  };

  console.log(`  → Creando ${name} en ${target}\n`);
  copyDir(TEMPLATE_DIR, target, vars);

  const deps = { ...DEPS };
  const devDeps = { ...DEV_DEPS };
  const scripts = {
    dev: "vite",
    build: "vue-tsc -b && vite build",
    preview: "vite preview",
    typecheck: "vue-tsc -b --force",
    format: 'prettier --write "src/**/*.{ts,vue,scss,json,md}"',
  };

  if (opts.gsap) {
    Object.assign(deps, EXTRA_DEPS.gsap.deps);
  }

  if (opts.eslint) {
    copyDir(path.join(EXTRAS_DIR, "eslint"), target, vars);
    Object.assign(devDeps, EXTRA_DEPS.eslint.devDeps);
    scripts.lint = "eslint .";
    scripts["lint:fix"] = "eslint . --fix";
  }

  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const pkg = {
    name,
    version: "1.0.0",
    private: true,
    type: "module",
    engines: { node: ">=20" },
    scripts,
    dependencies: sorted(deps),
    devDependencies: sorted(devDeps),
  };
  fs.writeFileSync(path.join(target, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  if (pm === "npm") {
    fs.appendFileSync(
      path.join(target, ".gitignore"),
      "\n# Este proyecto usa npm; un lock de pnpm hace que Vercel cambie de gestor.\npnpm-lock.yaml\npnpm-workspace.yaml\n",
    );
    fs.rmSync(path.join(target, "pnpm-workspace.yaml"), { force: true });
    const vercelPath = path.join(target, "vercel.json");
    const vercel = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
    vercel.buildCommand = "npm run build";
    fs.writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");
  } else {
    fs.appendFileSync(
      path.join(target, ".gitignore"),
      "\n# Este proyecto usa pnpm; un lock de npm hace que Vercel cambie de gestor.\npackage-lock.json\n",
    );
  }

  // .env local listo: apunta al backapp local.
  fs.copyFileSync(path.join(target, ".env.example"), path.join(target, ".env"));

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
    run("git", ["commit", "-q", "-m", "chore: scaffold inicial con create-frontapp"], target);
  }

  console.log(`
  ✔ Listo: ${name}

  Siguiente:
    cd ${name}${installed ? "" : `\n    ${vars.PM_INSTALL}`}
    ${vars.PM_RUN} dev            # http://localhost:5173  (API: http://localhost:${apiPort}/api)

  Dónde tocar primero:
    src/config/site.ts                    copy y datos de la marca
    src/styles/colorVariables.module.scss paleta (acento: ${color})
    index.html                            fuentes, meta tags, favicon

  Deploy: vercel --prod  (SPA rewrite en vercel.json)
`);
}

main().catch((e) => fail(e?.message || String(e)));
