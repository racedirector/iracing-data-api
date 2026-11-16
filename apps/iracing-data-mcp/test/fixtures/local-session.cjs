const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

async function localSession(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-config-"));
  await fs.chmod(directory, 0o700);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "credentials.json");
  const exp = Math.floor(Date.now() / 1000) + 3600;
  await fs.writeFile(
    file,
    JSON.stringify({
      access_token: `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.synthetic`,
      refresh_token: "synthetic-refresh",
      token_type: "Bearer",
      expires_in: 3600,
    }),
    { mode: 0o600 },
  );
  const env = {
    ...process.env,
    IRACING_AUTH_CLIENT: "synthetic-client",
    IRACING_MCP_CREDENTIAL_FILE: file,
  };
  delete env.IRACING_AUTH_SECRET;
  return { directory, file, env };
}

module.exports = { localSession };
