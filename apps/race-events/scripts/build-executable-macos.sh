#!/bin/sh

echo "Building MacOS executable"

mkdir -p build/macos
node --experimental-sea-config sea-config.json

cp $(command -v node) build/macos/race-events

codesign --remove-signature build/macos/race-events

pnpm dlx postject build/macos/race-events NODE_SEA_BLOB build/race-events.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA

codesign --sign - build/macos/race-events