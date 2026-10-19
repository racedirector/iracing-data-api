/** Static offline fetch replacement loaded by docs CLI subprocess tests. */
globalThis.fetch = async () =>
  new Response(process.env.IRACING_TEST_HTTP_BODY ?? "{}", {
    status: Number(process.env.IRACING_TEST_HTTP_STATUS ?? "200"),
    headers: { "content-type": "application/json" },
  });
