#!/usr/bin/env sh

set -eu

FILE_PATH="${1:-}"

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

node "$SCRIPT_DIR/normalize-fetch-runtime.mjs" "$FILE_PATH"

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.mjs|*.cjs|*.json|*.md|*.yaml|*.yml)
    pnpm --dir "$ROOT_DIR" exec prettier --write --config "$SCRIPT_DIR/generated.prettier.json" --ignore-path "$SCRIPT_DIR/generated.prettierignore" "$FILE_PATH"
    ;;
esac

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.mjs|*.cjs)
    pnpm --dir "$ROOT_DIR" exec eslint --config "$ROOT_DIR/eslint.config.mjs" --fix --no-warn-ignored "$FILE_PATH"
    ;;
esac
