#!/bin/sh

echo "Building Windows executable"

mkdir -p build/windows
node --experimental-sea-config sea-config.json

node -e "require('fs').copyFileSync(process.execPath, 'build/windows/sync-car-assets.exe')"

signtool remove /s build/windows/sync-car-assets.exe

pnpm dlx postject build/windows/sync-car-assets.exe NODE_SEA_BLOB build/sync-car-assets.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

signtool sign /fd SHA256 build/windows/sync-car-assets.exe