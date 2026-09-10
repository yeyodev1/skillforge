#!/usr/bin/env bash
# Empaqueta cada skill como <skill>.zip con la carpeta del skill como raíz del ZIP.
# Uso: ./scripts/package.sh            -> empaqueta todos los skills
#      ./scripts/package.sh <skill>    -> empaqueta solo ese skill
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
mkdir -p "$DIST"

package_one() {
  local skill_dir="$1"
  local name; name="$(basename "$skill_dir")"
  local parent; parent="$(dirname "$skill_dir")"
  rm -f "$DIST/$name.zip"
  (cd "$parent" && zip -rq "$DIST/$name.zip" "$name" -x '*.DS_Store' -x '__MACOSX/*')
  echo "✅ $DIST/$name.zip"
  unzip -Z1 "$DIST/$name.zip" | sed 's/^/   /'
}

if [[ $# -gt 0 ]]; then
  for s in "$@"; do
    dir="$(find "$ROOT/plugins" -type d -path "*/skills/$s" | head -1)"
    [[ -z "$dir" ]] && { echo "❌ Skill '$s' no encontrado"; exit 1; }
    package_one "$dir"
  done
else
  while IFS= read -r skill_md; do
    package_one "$(dirname "$skill_md")"
  done < <(find "$ROOT/plugins" -type f -path "*/skills/*/SKILL.md")
fi
