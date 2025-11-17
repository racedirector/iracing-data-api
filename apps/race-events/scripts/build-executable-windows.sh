#!/bin/sh

echo "Building Windows executable"

mkdir -p build/windows
node --experimental-sea-config sea-config.json

node -e "require('fs').copyFileSync(process.execPath, 'build/windows/race-events.exe')"

signtool remove /s build/windows/race-events.exe

pnpm dlx postject build/windows/race-events.exe NODE_SEA_BLOB build/race-events.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

signtool sign /fd SHA256 build/windows/race-events.exe