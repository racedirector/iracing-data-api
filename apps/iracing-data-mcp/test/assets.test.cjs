const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const entries = {
  cars: {
    1: {
      car_id: 1,
      folder: "/img/cars/example",
      small_image: "small.jpg",
      logo: "/img/logos/example.png",
      template_path: "templates/example.zip",
    },
  },
  tracks: {
    1: {
      track_id: 1,
      folder: "/img/tracks/example",
      small_image: "small.jpg",
      track_map:
        "https://members-assets.iracing.com/public/track-maps/example/",
      track_map_layers: { active: "active.svg", turns: "turns.svg" },
    },
  },
  series: { 32: { series_id: 32, logo: "seriesid_32.png", small_image: null } },
};

async function setup(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-assets-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const { createAssetCatalogs } = await import("../dist/adapters/assets.js");
  const { createAssetMediaReader } = await import("../dist/adapters/media.js");
  const { registerAssetResources } = await import("@iracing-data/mcp");
  const { Client } = await import("@modelcontextprotocol/client");
  const { InMemoryTransport, McpServer } =
    await import("@modelcontextprotocol/server");
  const requests = [];
  let tokens = 0;
  const fetchApi = async (input, init) => {
    const url = new URL(input);
    requests.push(url.href);
    const auth = new Headers(init?.headers).get("authorization");
    if (url.host === "members-ng.iracing.com") {
      assert.equal(auth, "Bearer TEST_TOKEN");
      const kind = { car: "cars", track: "tracks", series: "series" }[
        url.pathname.split("/")[2]
      ];
      assert.ok(kind);
      return Response.json({
        link: `https://cache.example.test/${kind}`,
        expires: new Date(Date.now() + 900000).toISOString(),
      });
    }
    assert.equal(auth, null);
    assert.equal(init.redirect, "error");
    if (url.host === "cache.example.test")
      return Response.json(entries[url.pathname.slice(1)]);
    assert.equal(init.credentials, "omit");
    if (url.pathname.endsWith(".svg"))
      return new Response("<svg/>", {
        headers: { "content-type": "image/svg+xml" },
      });
    return new Response(Uint8Array.from([1, 2, 3]), {
      headers: {
        "content-type": url.pathname.endsWith(".png")
          ? "image/png"
          : "image/jpeg",
      },
    });
  };
  const createCatalogs = () =>
    createAssetCatalogs(
      directory,
      async () => {
        tokens++;
        return "TEST_TOKEN";
      },
      fetchApi,
    );
  const server = new McpServer({ name: "assets-test", version: "1" });
  registerAssetResources(
    server,
    createCatalogs(),
    createAssetMediaReader(fetchApi),
  );
  const client = new Client({ name: "assets-client", version: "1" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
  t.after(async () => {
    await client.close();
    await server.close();
  });
  return { client, requests, directory, createCatalogs, tokens: () => tokens };
}

test("asset discovery is lazy; collections and entities return raw metadata and persist raw documents", async (t) => {
  const { client, requests, directory, createCatalogs, tokens } =
    await setup(t);
  assert.deepEqual(
    (await client.listResources()).resources
      .filter((entry) => entry.mimeType !== "application/schema+json")
      .map((r) => r.uri),
    [
      "iracing://assets/cars",
      "iracing://assets/tracks",
      "iracing://assets/series",
    ],
  );
  const templates = (
    await client.listResourceTemplates()
  ).resourceTemplates.map((r) => r.uriTemplate);
  assert.equal(templates.length, 10);
  assert.ok(templates.includes("iracing://track-maps/{track_id}/{layer}"));
  assert.equal(requests.length, 0);
  assert.equal(tokens(), 0);
  for (const kind of ["cars", "tracks", "series"]) {
    const id = kind === "series" ? 32 : 1;
    const responses = await Promise.all([
      client.readResource({ uri: `iracing://assets/${kind}` }),
      client.readResource({ uri: `iracing://assets/${kind}/${id}` }),
    ]);
    const [collection, entity] = responses.map((r) =>
      JSON.parse(r.contents[0].text),
    );
    assert.deepEqual(collection, entries[kind]);
    assert.deepEqual(entity, entries[kind][id]);
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(path.join(directory, `${kind}-assets.json`), "utf8"),
      ),
      entries[kind],
    );
  }
  assert.equal(tokens(), 3);
  assert.equal(requests.length, 6);
  for (const catalog of createCatalogs())
    assert.ok(await catalog.resolver.get(catalog.kind === "series" ? 32 : 1));
  assert.equal(requests.length, 6, "restarted resolvers use snapshots");
});

test("per-asset media indexes expose read-ready URIs without downloading media", async (t) => {
  const { client, requests } = await setup(t);
  for (const [kind, id] of [
    ["cars", 1],
    ["tracks", 1],
    ["series", 32],
  ]) {
    const response = await client.readResource({
      uri: `iracing://assets/${kind}/${id}/media`,
    });
    const body = JSON.parse(response.contents[0].text);
    assert.equal(body.kind, kind);
    assert.equal(body.id, id);
    assert.ok(body.images.length > 0);
    assert.ok(
      body.images.every((image) =>
        image.uri.startsWith(`iracing://images/${kind}/${id}/`),
      ),
    );
    assert.equal(body.track_maps.length, kind === "tracks" ? 2 : 0);
  }
  assert.equal(
    requests.length,
    6,
    "Only metadata API calls and linked downloads",
  );
  assert.ok(
    requests.every(
      (url) =>
        !url.includes("images-static") && !url.includes("members-assets"),
    ),
  );
});

test("images and map layers resolve verified paths and return unsigned MIME-tagged blobs", async (t) => {
  const { client, requests } = await setup(t);
  for (const [uri, expectedUrl, mime] of [
    [
      "iracing://images/cars/1/small_image",
      "https://images-static.iracing.com/img/cars/example/small.jpg",
      "image/jpeg",
    ],
    [
      "iracing://images/cars/1/logo",
      "https://images-static.iracing.com/img/logos/example.png",
      "image/png",
    ],
    [
      "iracing://images/tracks/1/small_image",
      "https://images-static.iracing.com/img/tracks/example/small.jpg",
      "image/jpeg",
    ],
    [
      "iracing://images/series/32/logo",
      "https://images-static.iracing.com/img/logos/series/seriesid_32.png",
      "image/png",
    ],
    [
      "iracing://track-maps/1/active",
      "https://members-assets.iracing.com/public/track-maps/example/active.svg",
      "image/svg+xml",
    ],
  ]) {
    const response = await client.readResource({ uri });
    assert.equal(response.contents[0].mimeType, mime);
    assert.ok(response.contents[0].blob);
    assert.equal(
      Buffer.from(response.contents[0].blob, "base64").toString("base64"),
      response.contents[0].blob,
    );
    assert.equal(response.contents[0].text, undefined);
    assert.equal(requests.at(-1), expectedUrl);
  }
  for (const uri of [
    "iracing://images/cars/0/logo",
    "iracing://images/cars/999/logo",
    "iracing://images/series/32/small_image",
    "iracing://images/cars/1/template_path",
    "iracing://track-maps/1/missing",
  ])
    await assert.rejects(client.readResource({ uri }));
});

test("URL resolution rejects foreign origins, credentials, traversal and unsupported selectors", async () => {
  const { imageUrl, trackMapUrl } = await import("@iracing-data/mcp");
  for (const reference of [
    "https://evil.test/image.png",
    "http://images-static.iracing.com/img/x.png",
    "https://user:password@images-static.iracing.com/img/x.png",
    "/img/x.png?secret=x",
    "/img/%2e%2e/x.png",
  ]) {
    assert.throws(
      () => imageUrl("cars", { logo: reference }, "logo"),
      /Unsafe/,
    );
  }
  assert.throws(() =>
    imageUrl("cars", { template_path: "/img/x.zip" }, "template_path"),
  );
  assert.throws(
    () => imageUrl("cars", { logo: null }, "logo"),
    /not available/,
  );
  assert.throws(
    () => imageUrl("cars", { logo: "x.png" }, "logo"),
    /no verified/,
  );
  for (const reference of [
    "../escape.svg",
    "https://evil.test/layer.svg",
    "//evil.test/layer.svg",
    "%2e%2e/escape.svg",
  ]) {
    assert.throws(
      () =>
        trackMapUrl(
          {
            track_map: entries.tracks[1].track_map,
            track_map_layers: { active: reference },
          },
          "active",
        ),
      /Unsafe/,
    );
  }
});

test("media transport rejects failures, non-images, oversized streams and cancellation", async () => {
  const { createAssetMediaReader } = await import("../dist/adapters/media.js");
  const url = new URL("https://images-static.iracing.com/img/test.png");
  const signal = new AbortController().signal;
  for (const response of [
    new Response("missing", { status: 404 }),
    new Response("<html/>", { headers: { "content-type": "text/html" } }),
    new Response("x", {
      headers: {
        "content-type": "image/png",
        "content-length": String(6 * 1024 * 1024),
      },
    }),
    new Response(new Uint8Array(5 * 1024 * 1024 + 1), {
      headers: { "content-type": "image/png" },
    }),
  ])
    await assert.rejects(
      createAssetMediaReader(async () => response)(url, signal),
    );
  await assert.rejects(
    createAssetMediaReader(async () => {
      throw new Error("redirect rejected");
    })(url, signal),
    /redirect/,
  );
  const aborted = new AbortController();
  aborted.abort();
  let fetches = 0;
  await assert.rejects(
    createAssetMediaReader(async () => {
      fetches++;
      throw new Error("Unexpected network after cancellation");
    })(url, aborted.signal),
    { name: "AbortError" },
  );
  assert.equal(fetches, 0);
});

test("invalid asset documents are not persisted and failed hydration can retry", async (t) => {
  const { createAssetCatalogs } = await import("../dist/adapters/assets.js");
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "mcp-assets-invalid-"),
  );
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  let loads = 0;
  const catalogs = createAssetCatalogs(
    directory,
    async () => "TEST_TOKEN",
    async (input) => {
      if (new URL(input).host === "members-ng.iracing.com")
        return Response.json({
          link: "https://cache.example.test/cars",
          expires: new Date(Date.now() + 900000).toISOString(),
        });
      loads++;
      return Response.json(loads === 1 ? { 2: { car_id: 1 } } : entries.cars);
    },
  );
  await assert.rejects(catalogs[0].resolver.all(), /key does not match/);
  await assert.rejects(fs.access(path.join(directory, "cars-assets.json")), {
    code: "ENOENT",
  });
  assert.ok(await catalogs[0].resolver.get(1));
  assert.equal(loads, 2);
});
