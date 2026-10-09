#!/usr/bin/env sh

# Authored wrapper for the pinned Data API axios generator.
# Input is iracing.json; output source/docs/bookkeeping remain generator-owned.
# Read release version from the reviewed manifest, disable generation timestamps,
# apply language post-processing and authored presentation, then format output.
# OPENAPI_DOC/OUTPUT_PACKAGE let freshness checks generate into an isolated tree.
# Fix schema/mapping or wrapper/post-processing inputs, never generated output.

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

export OPENAPI_GENERATOR="$ROOT_DIR/node_modules/.bin/openapi-generator-cli"
export TS_POST_PROCESS_FILE="$SCRIPT_DIR/openapi-generator-ts-post-process.sh"
export OPENAPI_DOC="${OPENAPI_DOC:-$ROOT_DIR/openapi/iracing.json}"
export OUTPUT_PACKAGE="${OUTPUT_PACKAGE:-$ROOT_DIR/packages/api/client/axios}"

PACKAGE_VERSION="$(node "$SCRIPT_DIR/read-package-version.mjs" "$ROOT_DIR/packages/api/client/axios/package.json")"

"$OPENAPI_GENERATOR" generate \
  --enable-post-process-file \
  -g typescript-axios \
  -i "$OPENAPI_DOC" \
  -o "$OUTPUT_PACKAGE" \
  --additional-properties=hideGenerationTimestamp=true,npmVersion="$PACKAGE_VERSION",useSingleRequestParameter=true,paramNaming='snake_case',npmName='@iracing-data/api-client-axios' \
  "$@"

node "$SCRIPT_DIR/normalize-client-presentation.js" axios "$OUTPUT_PACKAGE"
pnpm --dir "$ROOT_DIR" exec prettier --write --config "$SCRIPT_DIR/generated.prettier.json" --ignore-path "$SCRIPT_DIR/generated.prettierignore" "$OUTPUT_PACKAGE"
