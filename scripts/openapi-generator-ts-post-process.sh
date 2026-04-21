#!/usr/bin/env sh

set -eu

FILE_PATH="${1:-}"

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.mjs|*.cjs|*.json|*.md|*.yaml|*.yml)
    pnpm --dir "$ROOT_DIR" exec prettier --write "$FILE_PATH"
    ;;
esac

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.mjs|*.cjs)
    pnpm --dir "$ROOT_DIR" exec eslint --fix --no-warn-ignored "$FILE_PATH"
    ;;
esac
