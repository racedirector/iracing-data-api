#!/usr/bin/env sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"

export OPENAPI_GENERATOR="$ROOT_DIR/node_modules/.bin/openapi-generator-cli"
export RUST_POST_PROCESS_FILE="$SCRIPT_DIR/openapi-generator-rust-post-process.sh"
export OPENAPI_DOC="${OPENAPI_DOC:-$ROOT_DIR/openapi/iracing.json}"
export OUTPUT_PACKAGE="${OUTPUT_PACKAGE:-$ROOT_DIR/crates/iracing-data-api-client}"

PACKAGE_VERSION="$(node "$SCRIPT_DIR/read-package-version.mjs" "$ROOT_DIR/crates/iracing-data-api-client/Cargo.toml")"

"$OPENAPI_GENERATOR" generate \
  --enable-post-process-file \
  -g rust \
  -i "$OPENAPI_DOC" \
  -o "$OUTPUT_PACKAGE" \
  --additional-properties=hideGenerationTimestamp=true,packageVersion="$PACKAGE_VERSION",useSingleRequestParameter=true,packageName='iracing-data-api-client',topLevelApiClient=true,useChrono=true

node "$SCRIPT_DIR/normalize-rust-presentation.mjs" "$OUTPUT_PACKAGE"
rustfmt --edition 2021 --config-path "$ROOT_DIR" "$OUTPUT_PACKAGE/src/lib.rs"
pnpm --dir "$ROOT_DIR" exec prettier --write --config "$SCRIPT_DIR/generated.prettier.json" --ignore-path "$SCRIPT_DIR/generated.prettierignore" "$OUTPUT_PACKAGE/README.md" "$OUTPUT_PACKAGE/docs"
