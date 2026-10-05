import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

const {
  OAUTH_TOKEN_DOCUMENT_MAX_BYTES,
  OAuthTokenDocumentSessionStore,
  readOAuthTokenDocument,
  writeOAuthTokenDocument,
} = createRequire(import.meta.url)("../dist/index.js");

const TOKEN = {
  access_token: "synthetic-access",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "synthetic-refresh",
  refresh_token_expires_in: 7200,
  scope: "iracing.auth",
};

function token(suffix) {
  return {
    ...TOKEN,
    access_token: `synthetic-access-${suffix}`,
    refresh_token: `synthetic-refresh-${suffix}`,
  };
}

async function makePrivateTempDirectory(t, prefix = "oauth-token-document-") {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  if (process.platform !== "win32") await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

function rejectsWithCode(code) {
  return (error) => error?.code === code;
}

test("token document distinguishes missing state and round-trips the bare wire document", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");

  assert.equal(await readOAuthTokenDocument(file), undefined);
  await writeOAuthTokenDocument(file, TOKEN);
  assert.deepEqual(await readOAuthTokenDocument(file), TOKEN);
  assert.deepEqual(JSON.parse(await fs.readFile(file, "utf8")), TOKEN);

  if (process.platform !== "win32") {
    assert.equal((await fs.stat(directory)).mode & 0o777, 0o700);
    assert.equal((await fs.stat(file)).mode & 0o777, 0o600);
  }
});

test("token document validates nonempty tokens and finite positive durations", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");

  for (const invalid of [
    { ...TOKEN, access_token: "" },
    { ...TOKEN, access_token: "   " },
    { ...TOKEN, refresh_token: "" },
    { ...TOKEN, expires_in: 0 },
    { ...TOKEN, expires_in: -1 },
    { ...TOKEN, expires_in: Number.POSITIVE_INFINITY },
    { ...TOKEN, refresh_token_expires_in: 0 },
    { ...TOKEN, refresh_token_expires_in: Number.NaN },
  ]) {
    await assert.rejects(
      writeOAuthTokenDocument(file, invalid, { overwrite: true }),
      rejectsWithCode("invalid_document"),
    );
  }
});

test("token document rejects corruption, oversized files, and unreadable state", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const corrupt = path.join(directory, "corrupt.json");
  await fs.writeFile(corrupt, "broken JSON", { mode: 0o600 });
  await assert.rejects(
    readOAuthTokenDocument(corrupt),
    rejectsWithCode("invalid_document"),
  );

  const oversized = path.join(directory, "oversized.json");
  await fs.writeFile(
    oversized,
    "x".repeat(OAUTH_TOKEN_DOCUMENT_MAX_BYTES + 1),
    { mode: 0o600 },
  );
  await assert.rejects(
    readOAuthTokenDocument(oversized),
    rejectsWithCode("too_large"),
  );

  const unreadable = path.join(directory, "unreadable.json");
  await writeOAuthTokenDocument(unreadable, TOKEN);
  await assert.rejects(
    readOAuthTokenDocument(unreadable, {
      fileSystem: {
        open: async () => {
          const error = new Error("synthetic read failure");
          error.code = "EACCES";
          throw error;
        },
      },
    }),
    rejectsWithCode("io_error"),
  );
});

test(
  "token document rejects unsafe POSIX parents, file modes, symlinks, and nonregular files",
  { skip: process.platform === "win32" },
  async (t) => {
    const directory = await makePrivateTempDirectory(t);

    const unsafeParent = path.join(directory, "unsafe-parent");
    await fs.mkdir(unsafeParent, { mode: 0o755 });
    await fs.chmod(unsafeParent, 0o755);
    await assert.rejects(
      writeOAuthTokenDocument(
        path.join(unsafeParent, "credentials.json"),
        TOKEN,
      ),
      rejectsWithCode("unsafe_path"),
    );

    const unsafeMode = path.join(directory, "unsafe-mode.json");
    await writeOAuthTokenDocument(unsafeMode, TOKEN);
    await fs.chmod(unsafeMode, 0o644);
    await assert.rejects(
      readOAuthTokenDocument(unsafeMode),
      rejectsWithCode("unsafe_path"),
    );

    const real = path.join(directory, "real.json");
    await writeOAuthTokenDocument(real, TOKEN);
    const symbolic = path.join(directory, "symbolic.json");
    await fs.symlink(real, symbolic);
    await assert.rejects(
      readOAuthTokenDocument(symbolic),
      rejectsWithCode("unsafe_path"),
    );

    const nonregular = path.join(directory, "directory.json");
    await fs.mkdir(nonregular, { mode: 0o700 });
    await assert.rejects(
      readOAuthTokenDocument(nonregular),
      rejectsWithCode("unsafe_path"),
    );
  },
);

test("token document writer preserves the prior file and cleans temporary files when publication fails", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");
  await writeOAuthTokenDocument(file, token("old"));

  await assert.rejects(
    writeOAuthTokenDocument(file, token("new"), {
      overwrite: true,
      fileSystem: {
        rename: async () => {
          throw new Error("synthetic rename failure");
        },
      },
    }),
    rejectsWithCode("io_error"),
  );

  assert.deepEqual(await readOAuthTokenDocument(file), token("old"));
  assert.equal(
    (await fs.readdir(directory)).some((name) => name.endsWith(".tmp")),
    false,
  );
});

test("token document writer reports unsupported required directory durability", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");

  await assert.rejects(
    writeOAuthTokenDocument(file, TOKEN, {
      fileSystem: {
        open: async (target, flags, mode) => {
          const handle = await fs.open(target, flags, mode);
          if (target !== directory) return handle;
          return {
            sync: async () => {
              throw new Error("synthetic directory fsync failure");
            },
            close: () => handle.close(),
          };
        },
      },
    }),
    rejectsWithCode("durability_unsupported"),
  );

  assert.deepEqual(JSON.parse(await fs.readFile(file, "utf8")), TOKEN);
});

test("token document writer explicitly permits best-effort directory durability", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");

  await writeOAuthTokenDocument(file, TOKEN, {
    durability: "best-effort",
    fileSystem: {
      open: async (target, flags, mode) => {
        const handle = await fs.open(target, flags, mode);
        if (target !== directory) return handle;
        return {
          sync: async () => {
            throw new Error("synthetic directory fsync failure");
          },
          close: () => handle.close(),
        };
      },
    },
  });

  assert.deepEqual(await readOAuthTokenDocument(file), TOKEN);
});

test("single-document session store enforces its fixed key and survives restart, deletion, and clear", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");
  const options = { filePath: file, sessionKey: "local-session" };
  const store = new OAuthTokenDocumentSessionStore(options);

  await assert.rejects(store.get("other-session"), /configured session key/);
  assert.throws(
    () => store.set("other-session", TOKEN),
    /configured session key/,
  );
  assert.throws(() => store.del("other-session"), /configured session key/);

  await store.set("local-session", token("one"));
  assert.deepEqual(await store.get("local-session"), token("one"));
  assert.deepEqual(
    await new OAuthTokenDocumentSessionStore(options).get("local-session"),
    token("one"),
  );

  await store.del("local-session");
  assert.equal(await store.get("local-session"), undefined);
  assert.equal(
    await new OAuthTokenDocumentSessionStore(options).get("local-session"),
    undefined,
  );

  await store.set("local-session", token("two"));
  await store.clear();
  assert.equal(await store.get("local-session"), undefined);
  assert.equal(
    await new OAuthTokenDocumentSessionStore(options).get("local-session"),
    undefined,
  );
});

test("single-document session store serializes concurrent writes and publishes the durable winner", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");
  let releaseFirstRename;
  const renameGate = new Promise((resolve) => {
    releaseFirstRename = resolve;
  });
  let firstRenameStarted;
  const firstRename = new Promise((resolve) => {
    firstRenameStarted = resolve;
  });
  let renameCalls = 0;

  const store = new OAuthTokenDocumentSessionStore({
    filePath: file,
    sessionKey: "local-session",
    fileSystem: {
      rename: async (source, destination) => {
        renameCalls += 1;
        if (renameCalls === 1) {
          firstRenameStarted();
          await renameGate;
        }
        await fs.rename(source, destination);
      },
    },
  });

  const first = store.set("local-session", token("first"));
  const second = store.set("local-session", token("second"));
  await firstRename;
  assert.equal(renameCalls, 1);
  releaseFirstRename();
  await Promise.all([first, second]);

  assert.equal(renameCalls, 2);
  assert.deepEqual(await store.get("local-session"), token("second"));
  assert.deepEqual(await readOAuthTokenDocument(file), token("second"));
});

test("session store quarantines state when a published write cannot be durably confirmed", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");
  const store = new OAuthTokenDocumentSessionStore({
    filePath: file,
    sessionKey: "local-session",
    fileSystem: {
      open: async (target, flags, mode) => {
        const handle = await fs.open(target, flags, mode);
        if (target !== directory) return handle;
        return {
          sync: async () => {
            throw new Error("synthetic directory fsync failure");
          },
          close: () => handle.close(),
        };
      },
    },
  });

  await assert.rejects(
    store.set("local-session", token("rotated")),
    rejectsWithCode("durability_unsupported"),
  );
  await assert.rejects(
    store.get("local-session"),
    rejectsWithCode("store_quarantined"),
  );
});

test("session store deletion failure cannot resurrect stale in-memory credentials", async (t) => {
  const directory = await makePrivateTempDirectory(t);
  const file = path.join(directory, "credentials.json");
  await writeOAuthTokenDocument(file, token("old"));

  const store = new OAuthTokenDocumentSessionStore({
    filePath: file,
    sessionKey: "local-session",
    fileSystem: {
      open: async (target, flags, mode) => {
        const handle = await fs.open(target, flags, mode);
        if (target !== directory) return handle;
        return {
          sync: async () => {
            throw new Error("synthetic directory fsync failure");
          },
          close: () => handle.close(),
        };
      },
    },
  });

  assert.deepEqual(await store.get("local-session"), token("old"));
  await assert.rejects(
    store.del("local-session"),
    rejectsWithCode("durability_unsupported"),
  );
  await assert.rejects(
    store.get("local-session"),
    rejectsWithCode("store_quarantined"),
  );
  await assert.rejects(fs.stat(file), { code: "ENOENT" });
});
