#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

export OPENAPI_GENERATOR="$ROOT_DIR/node_modules/.bin/openapi-generator-cli"
export TS_POST_PROCESS_FILE="$SCRIPT_DIR/openapi-generator-ts-post-process.sh"
export OPENAPI_DOC="${OPENAPI_DOC:-$ROOT_DIR/openapi/iracing.json}"
export OUTPUT_PACKAGE="${OUTPUT_PACKAGE:-$ROOT_DIR/packages/api/client/fetch}"

PACKAGE_VERSION="$(node "$SCRIPT_DIR/read-package-version.mjs" "$ROOT_DIR/packages/api/client/fetch/package.json")"

"$OPENAPI_GENERATOR" generate \
  --enable-post-process-file \
  -g typescript-fetch \
  -i "$OPENAPI_DOC" \
  -o "$OUTPUT_PACKAGE" \
  --additional-properties=hideGenerationTimestamp=true,npmVersion="$PACKAGE_VERSION",useSingleRequestParameter=true,paramNaming='snake_case',npmName='@iracing-data/api-client-fetch' \
  "$@"

node "$SCRIPT_DIR/normalize-client-presentation.js" fetch "$OUTPUT_PACKAGE"
pnpm --dir "$ROOT_DIR" exec prettier --write --config "$SCRIPT_DIR/generated.prettier.json" --ignore-path "$SCRIPT_DIR/generated.prettierignore" "$OUTPUT_PACKAGE"
