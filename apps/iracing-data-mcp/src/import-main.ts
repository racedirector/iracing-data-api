import { importCredentials } from "./import-credentials.js";

if (
  process.argv.length !== 3 ||
  process.env.IRACING_MCP_OWNER_STOPPED !== "yes"
) {
  console.error(
    "Stop and drain the credential owner first; use the documented offline import command.",
  );
  process.exitCode = 1;
} else {
  void importCredentials(process.argv[2]!).catch(() => {
    console.error(
      "Credential import failed. Check the shared JSON document and owned 0700 directories/0600 file; keep all owners stopped and repeat host login if needed.",
    );
    process.exitCode = 1;
  });
}
