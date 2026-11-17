import { createFetchQueries } from "../../dist/index.js";

// Changing this injected strategy changes both transport hosts. No local file
// or OAuth registration is needed by either generic transport.
export function resolveLinkedCapabilities(strategy) {
  return (actor) => createFetchQueries(async () => `${strategy}:${actor.id}`);
}

export function fixtureFetch(input, init) {
  const url = new URL(input);
  if (url.hostname === "members-ng.iracing.com") {
    const token = new Headers(init.headers).get("authorization");
    return Promise.resolve(
      Response.json({
        link: `https://cache.example.test/${token.includes("alternate:") ? 2 : 1}`,
        expires: new Date(Date.now() + 60000).toISOString(),
      }),
    );
  }
  return Promise.resolve(
    Response.json({
      cust_id: Number(url.pathname.slice(1)),
      display_name: "Linked driver",
    }),
  );
}
