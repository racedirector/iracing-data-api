#!/bin/sh

echo "Building MacOS executable"

mkdir -p build/macos
node --experimental-sea-config sea-config.json

cp $(command -v node) build/macos/sync-track-assets

codesign --remove-signature build/macos/sync-track-assets

pnpm dlx postject build/macos/sync-track-assets NODE_SEA_BLOB build/sync-track-assets.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA

codesign --sign - build/macos/sync-track-assets