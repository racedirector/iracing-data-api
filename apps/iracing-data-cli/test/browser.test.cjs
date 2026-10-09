const assert = require("node:assert/strict");
const test = require("node:test");

test("Windows browser launch preserves OAuth URL query parameters", async () => {
  const { browserLaunchCommand } = await import("../dist/browser.js");
  const url =
    "https://oauth.iracing.com/oauth2/authorize?response_type=code&client_id=fixture-client&redirect_uri=http%3A%2F%2F127.0.0.1%3A54321%2Foauth%2Firacing%2Fcallback&scope=iracing.auth&state=fixture-state";

  assert.deepEqual(browserLaunchCommand("win32", url), {
    command: "rundll32",
    args: ["url.dll,FileProtocolHandler", url],
  });
});
