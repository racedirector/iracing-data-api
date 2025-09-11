#!/bin/sh

echo "Building MacOS executable"

mkdir -p build/macos
node --experimental-sea-config sea-config.json

cp $(command -v node) build/macos/sync-car-assets

codesign --remove-signature build/macos/sync-car-assets

npx postject build/macos/sync-car-assets NODE_SEA_BLOB build/sync-car-assets.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA

codesign --sign - build/macos/sync-car-assets