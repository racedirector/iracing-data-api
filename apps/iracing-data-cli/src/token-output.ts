import {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  rename,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import type { OAuthTokenResponse } from "@iracing-data/oauth-client";
import { stringify as stringifyYaml } from "yaml";

export type TokenFormat = "json" | "yaml";

export type TokenOutputOptions = {
  output?: string;
  format?: string;
  force?: boolean;
  cwd?: string;
  writeStdout?: (value: string) => void;
};

export function resolveTokenFormat(output?: string, explicit?: string): TokenFormat {
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

export function serializeToken(
  token: OAuthTokenResponse,
  format: TokenFormat,
): string {
  if (format === "json") return `${JSON.stringify(token, null, 2)}\n`;
  const value = stringifyYaml(token);
  return value.endsWith("\n") ? value : `${value}\n`;
}

async function pathExists(target: string) {
  try {
    return await lstat(target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function writeCredentialFile(
  destination: string,
  contents: string,
  force: boolean,
) {
  const existing = await pathExists(destination);
  if (existing?.isDirectory()) {
    throw new Error(`Credential destination is a directory: ${destination}`);
  }
  if (existing && !force) {
    throw new Error(
      `Credential file already exists: ${destination}. Pass --force to replace it.`,
    );
  }

  const parent = path.dirname(destination);
  await mkdir(parent, { recursive: true, mode: 0o700 });
  const temporary = path.join(
    parent,
    `.${path.basename(destination)}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`,
  );

  let created = false;
  try {
    const handle = await open(temporary, "wx", 0o600);
    created = true;
    try {
      await handle.writeFile(contents, { encoding: "utf8" });
      await handle.sync();
    } finally {
      await handle.close();
    }
    if (process.platform !== "win32") await chmod(temporary, 0o600);

    if (force) {
      await rename(temporary, destination);
      created = false;
    } else {
      await link(temporary, destination);
      await unlink(temporary);
      created = false;
    }
  } finally {
    if (created) {
      await unlink(temporary).catch(() => undefined);
    }
  }
}

export async function writeTokenOutput(
  token: OAuthTokenResponse,
  options: TokenOutputOptions = {},
) {
  const format = resolveTokenFormat(options.output, options.format);
  const serialized = serializeToken(token, format);

  if (!options.output) {
    (options.writeStdout ?? ((value) => process.stdout.write(value)))(serialized);
    return;
  }

  const destination = path.resolve(options.cwd ?? process.cwd(), options.output);
  await writeCredentialFile(destination, serialized, options.force ?? false);
}
