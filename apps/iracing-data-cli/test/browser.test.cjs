const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const { EventEmitter } = require("node:events");
const { syncBuiltinESMExports } = require("node:module");
const test = require("node:test");

for (const fails of [false, true]) {
  test(
    `Linux browser handoff settles without opener exit (spawn failure: ${fails})`,
    {
      skip: process.platform === "darwin" || process.platform === "win32",
    },
    async (t) => {
      const url = new URL(
        "https://example.test/authorize?state=synthetic&scope=iracing.auth",
      );
      const child = new EventEmitter();
      let detached = false;
      child.unref = () => {
        detached = true;
      };
      t.mock.method(childProcess, "spawn", (command, args, options) => {
        assert.equal(command, "xdg-open");
        assert.deepEqual(args, [url.href]);
        assert.deepEqual(options, { detached: true, stdio: "ignore" });
        return child;
      });
      syncBuiltinESMExports();
      t.after(() => {
        t.mock.restoreAll();
        syncBuiltinESMExports();
      });
      const { openUrlInBrowser } = await import("../dist/browser.js");
      const handoff = openUrlInBrowser(url);
      if (fails) {
        const error = Object.assign(new Error("spawn xdg-open ENOENT"), {
          code: "ENOENT",
        });
        child.emit("error", error);
        await assert.rejects(handoff, error);
        assert.equal(detached, false);
      } else {
        child.emit("spawn");
        await handoff;
        assert.equal(detached, true);
      }
    },
  );
}
