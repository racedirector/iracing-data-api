import { chmod, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

const exampleFile = path.join(repositoryRoot, ".env.example");
const targetFile = path.join(repositoryRoot, ".env");

try {
  const content = await readFile(exampleFile, "utf8");

  await writeFile(targetFile, content, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });

  if (process.platform !== "win32") await chmod(targetFile, 0o600);

  console.info(
    JSON.stringify({ version: 1, created: true, path: ".env" }, null, 2),
  );
} catch (error) {
  if (error?.code === "EEXIST") {
    console.info(
      JSON.stringify({ version: 1, created: false, path: ".env" }, null, 2),
    );
  } else {
    console.error(
      JSON.stringify(
        { version: 1, error: "unable_to_prepare_env", path: ".env" },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
}
