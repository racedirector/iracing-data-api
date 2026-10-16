/**
 * CLI serialization/output policy over shared OAuth persistence primitives.
 *
 * Explicit format wins; otherwise .yaml/.yml select YAML and all other paths select
 * JSON. Login chooses a destination so successful login stdout stays empty; generic
 * writers can emit serialized data to stdout when no destination is supplied.
 * Alternate destinations refuse replacement without force; shared login destinations
 * normally request overwrite. Relative destinations resolve against the selected cwd.
 *
 * JSON token output validates and delegates to the OAuth token-document writer in
 * packages/oauth/client/src/storage/token-document-store.ts. It owns secure path,
 * size, atomic publication and required directory-fsync semantics. The CLI explicitly
 * chooses best-effort directory durability on Windows, where host ACLs replace POSIX
 * mode guarantees. Do not copy the durable-store implementation into this module.
 *
 * YAML tokens and documentation use the generic writer: exclusive same-directory
 * temporary file, file sync and link/rename publication with cleanup. That writer
 * does not provide the JSON token store's full validation or parent-directory sync
 * contract. All token documents contain secrets; raw causes must not be logged by
 * command diagnostics. Output is data, not a diagnostic channel.
 */
import path from "node:path";
import {
  oauthTokenDocumentFileSystem,
  serializeOAuthTokenDocument,
  writeOAuthTokenDocument,
  type OAuthTokenDocumentFileSystem,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-client";
import { stringify as stringifyYaml } from "yaml";
import type { FileHandle } from "node:fs/promises";

/** Supported serialized document formats for command output. */
export type TokenFormat = "json" | "yaml";

/**
 * Filesystem capability set shared with the hardened OAuth token-document writer for
 * injectable host and test I/O.
 */
export type TokenOutputFileSystem = OAuthTokenDocumentFileSystem;

/** Default filesystem implementation shared with durable OAuth token documents. */
export const tokenOutputFileSystem = oauthTokenDocumentFileSystem;

/**
 * Destination, serialization, overwrite, and I/O policy shared by token-producing CLI
 * commands.
 */
export interface TokenOutputOptions {
  /** Writes the command result to the configured destination. */
  output?: string;

  /** Explicit JSON or YAML serialization choice. */
  format?: string;

  /** Whether an existing output file may be replaced. */
  force?: boolean;

  /** Human-readable document kind used in output errors. */
  outputLabel?: "Credential" | "Documentation";

  /** Directory used to resolve relative output paths. */
  cwd?: string;

  /**
   * Injected writer for serialized standard output.
   * @param {string} value - Input value to validate, store, or serialize.
   */
  writeStdout?: (value: string) => void;

  /** Filesystem operations supplied by the host for persistence. */
  fileSystem?: TokenOutputFileSystem;
}

/**
 * Resolves an explicit format first, then infers YAML from the destination extension and
 * otherwise defaults to JSON.
 * @param {string} output - Output path used to infer the default serialization format.
 * @param {string} explicit - Explicit output format selected on the command line.
 * @returns {TokenFormat} Selected JSON or YAML format.
 * @throws {Error} If an explicit format is neither JSON nor YAML.
 */
export function resolveTokenFormat(
  output?: string,
  explicit?: string,
): TokenFormat {
  if (explicit !== undefined) {
    if (explicit === "json" || explicit === "yaml") {
      return explicit;
    }

    throw new Error(`Unsupported output format: ${explicit}`);
  }

  if (output) {
    const extension = path.extname(output).toLowerCase();

    if (extension === ".yaml" || extension === ".yml") {
      return "yaml";
    }
  }

  return "json";
}

/**
 * Serializes non-secret command documents deterministically with a trailing newline for stdout
 * and file output.
 * @param {unknown} token - OAuth credential or command document to serialize.
 * @param {TokenFormat} format - JSON or YAML serialization selected by the caller.
 * @returns {string} Serialized document ending with a newline.
 */
export function serializeDocument(token: unknown, format: TokenFormat): string {
  if (format === "json") {
    return `${JSON.stringify(token, null, 2)}\n`;
  }

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
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

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
  {
    force,
    fileSystem,
    label,
  }: { force: boolean; fileSystem: TokenOutputFileSystem; label: string },
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

  await ensureOutputParent(fileSystem, parent, label);

  const temporary = path.join(
    parent,
    `.${path.basename(destination)}.${String(process.pid)}.${String(Date.now())}.${Math.random().toString(16).slice(2)}.tmp`,
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

    await writeTemporaryContents(handle, contents, destination, label);

    if (process.platform !== "win32") {
      await fileSystem.chmod(temporary, 0o600);
    }

    await publishTemporaryFile(fileSystem, {
      temporary,
      destination,
      force,
      label,
    });
    created = false;
  } finally {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- A write, chmod, or publish failure reaches finally with a temporary file still present; TypeScript does not model those exceptional edges.
    if (created) {
      await fileSystem.unlink(temporary).catch(() => undefined);
    }
  }
}

/**
 * Writes a generic command document to stdout or through the atomic file-output path without
 * applying token-secret policy.
 * @param {unknown} token - OAuth credential or command document to serialize.
 * @param {TokenOutputOptions} options - Destination, serialization format, overwrite policy, and output capabilities.
 * @returns {Promise<void>} Completion after the document has been written.
 */
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

  await writeFileOutput(destination, serialized, {
    force: options.force ?? false,
    fileSystem: options.fileSystem ?? tokenOutputFileSystem,
    label: options.outputLabel ?? "Credential",
  });
}

/**
 * Serializes OAuth credentials, delegating JSON validation and canonicalization to the
 * hardened token-document owner.
 * @param {OAuthTokenResponse} token - OAuth credential or command document to serialize.
 * @param {TokenFormat} format - JSON or YAML serialization selected by the caller.
 * @returns {string} Serialized credential document ending with a newline.
 */
export function serializeToken(
  token: OAuthTokenResponse,
  format: TokenFormat,
): string {
  if (format === "json") {
    return serializeOAuthTokenDocument(token);
  }

  return serializeDocument(token, format);
}

async function writeJsonTokenOutput(
  token: OAuthTokenResponse,
  destination: string,
  force: boolean,
  fileSystem: TokenOutputFileSystem,
) {
  const existing = await pathExists(fileSystem, destination, "Credential");

  if (existing?.isDirectory()) {
    throw new Error(`Credential destination is a directory: ${destination}`);
  }

  if (existing && !force) {
    throw new Error(
      `Credential file already exists: ${destination}. Pass --force to replace it.`,
    );
  }

  try {
    await writeOAuthTokenDocument(destination, token, {
      overwrite: force,
      durability: process.platform === "win32" ? "best-effort" : "required",
      fileSystem,
    });
  } catch (error) {
    throwTokenOutputError(error, destination);
  }
}

/**
 * Persists OAuth credentials using the hardened JSON token writer when possible, while
 * preserving explicit alternate-format output behavior.
 * @param {OAuthTokenResponse} token - OAuth credential or command document to serialize.
 * @param {TokenOutputOptions} options - Destination, serialization format, overwrite policy, and output capabilities.
 * @returns {Promise<void>} Completion of the requested operation.
 */
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

    await writeJsonTokenOutput(
      token,
      destination,
      options.force ?? false,
      options.fileSystem ?? tokenOutputFileSystem,
    );

    return;
  }

  await writeDocumentOutput(token, options);
}

async function writeTemporaryContents(
  handle: FileHandle,
  contents: string,
  destination: string,
  label: string,
) {
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
}

function throwTokenOutputError(error: unknown, destination: string): never {
  const message = error instanceof Error ? error.message : "";

  if (message.startsWith("Unable to create OAuth token document directory:")) {
    throw new Error(
      `Unable to create credential parent directory: ${path.dirname(destination)}`,
      { cause: error },
    );
  }

  if (message.startsWith("Unable to create temporary OAuth token document")) {
    throw new Error(
      `Unable to create temporary credential file for: ${destination}`,
      { cause: error },
    );
  }

  if (message.startsWith("Unable to write temporary OAuth token document")) {
    throw new Error(
      `Unable to write temporary credential file for: ${destination}`,
      { cause: error },
    );
  }

  if (message.startsWith("Unable to atomically publish OAuth token document")) {
    throw new Error(
      `Unable to replace credential destination: ${destination}`,
      { cause: error },
    );
  }

  if (message.startsWith("OAuth token document already exists:")) {
    throw new Error(
      `Credential file already exists: ${destination}. Pass --force to replace it.`,
      { cause: error },
    );
  }

  throw error;
}

async function publishTemporaryFile(
  fileSystem: TokenOutputFileSystem,
  {
    temporary,
    destination,
    force,
    label,
  }: { temporary: string; destination: string; force: boolean; label: string },
) {
  try {
    if (force) {
      await fileSystem.rename(temporary, destination);
    } else {
      await fileSystem.link(temporary, destination);
      await fileSystem.unlink(temporary);
    }
  } catch (error) {
    throw new Error(
      `Unable to replace ${label.toLowerCase()} destination: ${destination}`,
      {
        cause: error,
      },
    );
  }
}

async function ensureOutputParent(
  fileSystem: TokenOutputFileSystem,
  parent: string,
  label: string,
) {
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
}
