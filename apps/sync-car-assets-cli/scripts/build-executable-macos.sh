#!/bin/sh

echo "Building MacOS executable"

mkdir -p build/macos
node --experimental-sea-config sea-config.json

cp $(command -v node) build/macos/driver-lookup

codesign --remove-signature build/macos/driver-lookup

pnpm dlx postject build/macos/driver-lookup NODE_SEA_BLOB build/driver-lookup.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA

codesign --sign - build/macos/driver-lookup