const assert = require("node:assert/strict");
const test = require("node:test");

test("transport barrels preserve the package-root hosting API", async () => {
  const root = await import("../dist/index.js");
  const transports = await import("../dist/transports/index.js");
  const http = await import("../dist/transports/http/index.js");
  const stdio = await import("../dist/transports/stdio/index.js");
  assert.equal(root.createMcpRouter, http.createMcpRouter);
  assert.equal(root.startMcpHttpServer, http.startMcpHttpServer);
  assert.equal(root.startMcpStdio, stdio.startMcpStdio);
  assert.equal(transports.createMcpRouter, http.createMcpRouter);
  assert.equal(transports.startMcpHttpServer, http.startMcpHttpServer);
  assert.equal(transports.startMcpStdio, stdio.startMcpStdio);
});

test("resource barrels expose catalog and asset features without transport startup", async () => {
  const resources = await import("../dist/resources/index.js");
  const catalogs = await import("../dist/resources/catalogs/index.js");
  const assets = await import("../dist/resources/assets/index.js");
  assert.equal(
    resources.registerReferenceResources,
    catalogs.registerReferenceResources,
  );
  assert.equal(resources.registerAssetResources, assets.registerAssetResources);
  assert.equal(resources.createAssetMediaReader, assets.createAssetMediaReader);
  assert.equal(typeof resources.createFileBackedResolver, "function");
});
