#!/usr/bin/env sh

set -eu

FILE_PATH="${1:-}"

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

case "$FILE_PATH" in
  *.rs)
    rustfmt --edition 2021 --config-path "$ROOT_DIR" "$FILE_PATH"
    ;;
esac
