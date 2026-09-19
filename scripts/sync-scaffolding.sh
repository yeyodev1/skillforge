#!/usr/bin/env bash
# Copia los CLIs de scaffolding dentro del skill constructor-web-bakano.
# La fuente de verdad es ~/tools/scaffolding (o la ruta que pases); aquí solo vive una copia
# para que el skill funcione en máquinas donde los CLIs no están enlazados ni publicados.
# Uso: ./scripts/sync-scaffolding.sh [ruta-al-scaffolding]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$HOME/tools/scaffolding}"
DEST="$ROOT/plugins/constructor-web-bakano/skills/constructor-web-bakano/scaffolding"

for cli in create-backapp create-frontapp; do
  [[ -f "$SRC/$cli/bin/$cli.js" ]] || { echo "❌ No encuentro $SRC/$cli"; exit 1; }
  mkdir -p "$DEST/$cli"
  rsync -a --delete --exclude node_modules --exclude .DS_Store --exclude '.env' "$SRC/$cli/" "$DEST/$cli/"
  echo "✅ $cli $(node -p "require('$SRC/$cli/package.json').version")"
done
