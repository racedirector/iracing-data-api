#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

export OPENAPI_GENERATOR="$ROOT_DIR/node_modules/.bin/openapi-generator-cli"
export TS_POST_PROCESS_FILE="$SCRIPT_DIR/openapi-generator-ts-post-process.sh"
export OPENAPI_DOC="$ROOT_DIR/openapi/iracing.json"
export OUTPUT_PACKAGE="$ROOT_DIR/packages/api/client/fetch"

$OPENAPI_GENERATOR generate \
  --enable-post-process-file \
  -g typescript-fetch \
  -i $OPENAPI_DOC \
  -o $OUTPUT_PACKAGE \
  --additional-properties=useSingleRequestParameter=true,paramNaming='snake_case',npmName='@iracing-data/api-client-fetch'
