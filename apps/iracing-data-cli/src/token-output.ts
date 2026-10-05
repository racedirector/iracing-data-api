import type { FileHandle } from "node:fs/promises";
import path from "node:path";
import { stringify as stringifyYaml } from "yaml";
import {
  oauthTokenDocumentFileSystem,
  serializeOAuthTokenDocument,
  writeOAuthTokenDocument,
  type OAuthTokenDocumentFileSystem,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";

export type TokenFormat = "json" | "yaml";
export type TokenOutputFileSystem = OAuthTokenDocumentFileSystem;
export const tokenOutputFileSystem = oauthTokenDocumentFileSystem;

export type TokenOutputOptions = {
  output?: string;
  format?: string;
  force?: boolean;
  outputLabel?: "Credential" | "Documentation";
  cwd?: string;
  writeStdout?: (value: string) => void;
  fileSystem?: TokenOutputFileSystem;
};

export function resolveTokenFormat(
  output?: string,
  explicit?: string,
): TokenFormat {
  if (explicit !== undefined) {
    if (explicit === "json" || explicit === "yaml") return explicit;
    throw new Error(`Unsupported output format: ${explicit}`);
  }
  if (output) {
    const extension = path.extname(output).toLowerCase();
    if (extension === ".yaml" || extension === ".yml") return "yaml";
  }
  return "json";
}

export function serializeDocument(token: unknown, format: TokenFormat): string {
  if (format === "json") return `${JSON.stringify(token, null, 2)}\n`;
  const value = stringifyYaml(token);
  return value.endsWith("\n") ? value : `${value}\n`;
}

async function pathExists(
  fileSystem: TokenOutputFileSystem,
  target: string,
  label: string,
) {
  try {
    return await fileSystem.lstat(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw new Error(
      `Unable to inspect ${label.toLowerCase()} destination: ${target}`,
      {
        cause: error,
      },
    );
  }
}

async function writeFileOutput(
  destination: string,
  contents: string,
  force: boolean,
  fileSystem: TokenOutputFileSystem,
  label: string,
) {
  const existing = await pathExists(fileSystem, destination, label);
  if (existing?.isDirectory()) {
    throw new Error(`${label} destination is a directory: ${destination}`);
  }
  if (existing && !force) {
    throw new Error(
      `${label} file already exists: ${destination}. Pass --force to replace it.`,
    );
  }

  const parent = path.dirname(destination);
  try {
    await fileSystem.mkdir(parent, { recursive: true, mode: 0o700 });
  } catch (error) {
    throw new Error(
      `Unable to create ${label.toLowerCase()} parent directory: ${parent}`,
      {
        cause: error,
      },
    );
  }

  const temporary = path.join(
    parent,
    `.${path.basename(destination)}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
  );

  let created = false;
  try {
    let handle: FileHandle;
    try {
      handle = await fileSystem.open(temporary, "wx", 0o600);
      created = true;
    } catch (error) {
      throw new Error(
        `Unable to create temporary ${label.toLowerCase()} file for: ${destination}`,
        {
          cause: error,
        },
      );
    }

    try {
      await handle.writeFile(contents, { encoding: "utf8" });
      await handle.sync();
    } catch (error) {
      throw new Error(
        `Unable to write temporary ${label.toLowerCase()} file for: ${destination}`,
        {
          cause: error,
        },
      );
    } finally {
      await handle.close();
    }

    if (process.platform !== "win32") {
      await fileSystem.chmod(temporary, 0o600);
    }

    try {
      if (force) {
        await fileSystem.rename(temporary, destination);
      } else {
        await fileSystem.link(temporary, destination);
        await fileSystem.unlink(temporary);
      }
      created = false;
    } catch (error) {
      throw new Error(
        `Unable to replace ${label.toLowerCase()} destination: ${destination}`,
        {
          cause: error,
        },
      );
    }
  } finally {
    if (created) {
      await fileSystem.unlink(temporary).catch(() => undefined);
    }
  }
}

export async function writeDocumentOutput(
  token: unknown,
  options: TokenOutputOptions = {},
): Promise<void> {
  const format = resolveTokenFormat(options.output, options.format);
  const serialized = serializeDocument(token, format);

  if (!options.output) {
    (options.writeStdout ?? ((value) => process.stdout.write(value)))(
      serialized,
    );
    return;
  }

  const destination = path.resolve(
    options.cwd ?? process.cwd(),
    options.output,
  );
  await writeFileOutput(
    destination,
    serialized,
    options.force ?? false,
    options.fileSystem ?? tokenOutputFileSystem,
    options.outputLabel ?? "Credential",
  );
}

export function serializeToken(
  token: OAuthTokenResponse,
  format: TokenFormat,
): string {
  if (format === "json") return serializeOAuthTokenDocument(token);
  return serializeDocument(token, format);
}

export async function writeTokenOutput(
  token: OAuthTokenResponse,
  options: TokenOutputOptions = {},
): Promise<void> {
  const format = resolveTokenFormat(options.output, options.format);
  if (!options.output) {
    (options.writeStdout ?? ((value) => process.stdout.write(value)))(
      serializeToken(token, format),
    );
    return;
  }

  if (format === "json") {
    const destination = path.resolve(
      options.cwd ?? process.cwd(),
      options.output,
    );
    await writeOAuthTokenDocument(destination, token, {
      overwrite: options.force ?? false,
      durability: process.platform === "win32" ? "best-effort" : "required",
      fileSystem: options.fileSystem,
    });
    return;
  }

  await writeDocumentOutput(token, options);
}
