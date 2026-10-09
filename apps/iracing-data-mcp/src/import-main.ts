import {
  importClientSecret,
  importCredentials,
  importCredentialsJson,
} from "./import-credentials.js";

async function readStdin() {
  process.stdin.setEncoding("utf8");
  let value = "";

  for await (const chunk of process.stdin) {
    value += chunk;
  }

  return value;
}

async function runImport() {
  if (
    process.argv.length !== 3 ||
    process.env.IRACING_MCP_OWNER_STOPPED !== "yes"
  ) {
    throw new Error("Owner must be stopped.");
  }

  const source = process.argv[2]!;

  if (source === "--credentials-stdin") {
    await importCredentialsJson(await readStdin());
    return;
  }

  if (source === "--client-secret-stdin") {
    await importClientSecret(await readStdin());
    return;
  }

  await importCredentials(source);
}

void runImport().catch(() => {
  console.error(
    "Credential import failed. Keep all owners stopped, verify the Docker-managed data volume, and repeat host login if needed.",
  );
  process.exitCode = 1;
});
