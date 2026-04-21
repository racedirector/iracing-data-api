#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

export OPENAPI_GENERATOR="$ROOT_DIR/node_modules/.bin/openapi-generator-cli"
export RUST_POST_PROCESS_FILE="$SCRIPT_DIR/openapi-generator-rust-post-process.sh"
export OPENAPI_DOC="$ROOT_DIR/openapi/iracing.json"
export OUTPUT_PACKAGE="$ROOT_DIR/crates/iracing-data-api-client"

$OPENAPI_GENERATOR generate \
  --enable-post-process-file \
  -g rust \
  -i $OPENAPI_DOC \
  -o $OUTPUT_PACKAGE \
  --additional-properties=useSingleRequestParameter=true,packageName='iracing-data-api-client',topLevelApiClient='true'

if ! grep -q '^\[lints\]' "$OUTPUT_PACKAGE/Cargo.toml"; then
  cat <<'EOF' >> "$OUTPUT_PACKAGE/Cargo.toml"

[lints]
workspace = true
EOF
fi
