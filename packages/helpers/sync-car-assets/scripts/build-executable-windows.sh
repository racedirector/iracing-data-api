#!/bin/sh

echo "Building Windows executable"

node --experimental-sea-config sea-config.json

node -e "require('fs').copyFileSync(process.execPath, 'sync-car-assets.exe')"

signtool remove /s sync-car-assets.exe

npx postject sync-car-assets.exe NODE_SEA_BLOB sea-prep.blob `
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

signtool sign /fd SHA256 sync-car-assets.exe