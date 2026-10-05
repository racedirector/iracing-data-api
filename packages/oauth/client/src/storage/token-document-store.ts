import { randomUUID } from "node:crypto";
import {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  rename,
  unlink,
  type FileHandle,
} from "node:fs/promises";
import path from "node:path";
import {
  OAuthTokenResponseSchema,
  type OAuthTokenResponse,
} from "@iracing-data/oauth-schema";
import type { SessionStore } from "../schema";
import type { GetOptions } from "./index";

export const OAUTH_TOKEN_DOCUMENT_MAX_BYTES = 64 * 1024;

export type OAuthTokenDocumentDurability = "required" | "best-effort";

export type OAuthTokenDocumentErrorCode =
  | "invalid_document"
  | "unsafe_path"
  | "too_large"
  | "io_error"
  | "durability_unsupported"
  | "store_quarantined";

export class OAuthTokenDocumentError extends Error {
  constructor(
    public readonly code: OAuthTokenDocumentErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "OAuthTokenDocumentError";
  }
}

export type OAuthTokenDocumentFileSystem = {
  chmod(path: string, mode: number): Promise<void>;
  link(existingPath: string, newPath: string): Promise<void>;
  lstat(path: string): ReturnType<typeof lstat>;
  mkdir(
    path: string,
    options: Parameters<typeof mkdir>[1],
  ): ReturnType<typeof mkdir>;
  open(path: string, flags: string, mode: number): Promise<FileHandle>;
  rename(oldPath: string, newPath: string): Promise<void>;
  unlink(path: string): Promise<void>;
};

export const oauthTokenDocumentFileSystem: OAuthTokenDocumentFileSystem = {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  rename,
  unlink,
};

export type OAuthTokenDocumentReadOptions = {
  fileSystem?: Partial<OAuthTokenDocumentFileSystem>;
};

export type OAuthTokenDocumentWriteOptions = OAuthTokenDocumentReadOptions & {
  overwrite?: boolean;
  durability?: OAuthTokenDocumentDurability;
};

export type OAuthTokenDocumentSessionStoreOptions = {
  filePath: string;
  sessionKey: string;
  durability?: OAuthTokenDocumentDurability;
  fileSystem?: Partial<OAuthTokenDocumentFileSystem>;
};

type FileStats = Awaited<ReturnType<typeof lstat>>;

function resolveFileSystem(
  overrides?: Partial<OAuthTokenDocumentFileSystem>,
): OAuthTokenDocumentFileSystem {
  return { ...oauthTokenDocumentFileSystem, ...overrides };
}

function isErrno(error: unknown, code: string) {
  return (error as NodeJS.ErrnoException | undefined)?.code === code;
}

function ioError(message: string, cause: unknown) {
  if (cause instanceof OAuthTokenDocumentError) return cause;
  return new OAuthTokenDocumentError("io_error", message, cause);
}

async function inspectPath(
  fileSystem: OAuthTokenDocumentFileSystem,
  target: string,
  description: string,
) {
  try {
    return await fileSystem.lstat(target);
  } catch (error) {
    if (isErrno(error, "ENOENT")) return undefined;
    throw ioError(`Unable to inspect ${description}: ${target}`, error);
  }
}

function assertPosixOwnershipAndMode(
  stats: FileStats,
  target: string,
  expectedMode: number,
  description: string,
) {
  if (process.platform === "win32") return;

  const uid = typeof process.getuid === "function" ? process.getuid() : undefined;
  if (uid !== undefined && stats.uid !== uid) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `${description} is not owned by the current user: ${target}`,
    );
  }

  const mode = stats.mode & 0o777;
  if (mode !== expectedMode) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `${description} must use mode ${expectedMode.toString(8)}: ${target}`,
    );
  }
}

function assertSecureDirectory(stats: FileStats, target: string) {
  if (stats.isSymbolicLink()) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `OAuth token document directory must not be a symbolic link: ${target}`,
    );
  }
  if (!stats.isDirectory()) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `OAuth token document parent is not a directory: ${target}`,
    );
  }
  assertPosixOwnershipAndMode(
    stats,
    target,
    0o700,
    "OAuth token document directory",
  );
}

function assertSecureFile(stats: FileStats, target: string) {
  if (stats.isSymbolicLink()) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `OAuth token document must not be a symbolic link: ${target}`,
    );
  }
  if (!stats.isFile()) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `OAuth token document is not a regular file: ${target}`,
    );
  }
  if (stats.size > OAUTH_TOKEN_DOCUMENT_MAX_BYTES) {
    throw new OAuthTokenDocumentError(
      "too_large",
      `OAuth token document exceeds ${OAUTH_TOKEN_DOCUMENT_MAX_BYTES} bytes: ${target}`,
    );
  }
  assertPosixOwnershipAndMode(
    stats,
    target,
    0o600,
    "OAuth token document",
  );
}

async function ensureSecureParent(
  fileSystem: OAuthTokenDocumentFileSystem,
  parent: string,
) {
  const existing = await inspectPath(
    fileSystem,
    parent,
    "OAuth token document directory",
  );
  if (existing) {
    assertSecureDirectory(existing, parent);
    return;
  }

  try {
    await fileSystem.mkdir(parent, { recursive: true, mode: 0o700 });
  } catch (error) {
    throw ioError(
      `Unable to create OAuth token document directory: ${parent}`,
      error,
    );
  }

  if (process.platform !== "win32") {
    try {
      await fileSystem.chmod(parent, 0o700);
    } catch (error) {
      throw ioError(
        `Unable to secure OAuth token document directory: ${parent}`,
        error,
      );
    }
  }

  const created = await inspectPath(
    fileSystem,
    parent,
    "OAuth token document directory",
  );
  if (!created) {
    throw new OAuthTokenDocumentError(
      "io_error",
      `OAuth token document directory was not created: ${parent}`,
    );
  }
  assertSecureDirectory(created, parent);
}

function validateTokenDocument(value: unknown): OAuthTokenResponse {
  const parsed = OAuthTokenResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new OAuthTokenDocumentError(
      "invalid_document",
      "OAuth token document does not match OAuthTokenResponseSchema.",
      parsed.error,
    );
  }

  const token = parsed.data;
  if (!token.access_token.trim()) {
    throw new OAuthTokenDocumentError(
      "invalid_document",
      "OAuth token document access_token must be nonempty.",
    );
  }
  if (
    token.refresh_token !== undefined &&
    !token.refresh_token.trim()
  ) {
    throw new OAuthTokenDocumentError(
      "invalid_document",
      "OAuth token document refresh_token must be nonempty when present.",
    );
  }
  if (!Number.isFinite(token.expires_in) || token.expires_in <= 0) {
    throw new OAuthTokenDocumentError(
      "invalid_document",
      "OAuth token document expires_in must be finite and positive.",
    );
  }
  if (
    token.refresh_token_expires_in !== undefined &&
    (!Number.isFinite(token.refresh_token_expires_in) ||
      token.refresh_token_expires_in <= 0)
  ) {
    throw new OAuthTokenDocumentError(
      "invalid_document",
      "OAuth token document refresh_token_expires_in must be finite and positive when present.",
    );
  }

  return token;
}

export function serializeOAuthTokenDocument(token: OAuthTokenResponse): string {
  const normalized = validateTokenDocument(token);
  const serialized = `${JSON.stringify(normalized, null, 2)}\n`;
  if (Buffer.byteLength(serialized, "utf8") > OAUTH_TOKEN_DOCUMENT_MAX_BYTES) {
    throw new OAuthTokenDocumentError(
      "too_large",
      `OAuth token document exceeds ${OAUTH_TOKEN_DOCUMENT_MAX_BYTES} bytes.`,
    );
  }
  return serialized;
}

async function syncDirectory(
  fileSystem: OAuthTokenDocumentFileSystem,
  directory: string,
  durability: OAuthTokenDocumentDurability,
) {
  let handle: FileHandle | undefined;
  try {
    handle = await fileSystem.open(directory, "r", 0o700);
    await handle.sync();
  } catch (error) {
    if (durability === "best-effort") return;
    throw new OAuthTokenDocumentError(
      "durability_unsupported",
      `Unable to durably synchronize OAuth token document directory: ${directory}`,
      error,
    );
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

export async function readOAuthTokenDocument(
  filePath: string,
  options: OAuthTokenDocumentReadOptions = {},
): Promise<OAuthTokenResponse | undefined> {
  const destination = path.resolve(filePath);
  const parent = path.dirname(destination);
  const fileSystem = resolveFileSystem(options.fileSystem);
  const before = await inspectPath(
    fileSystem,
    destination,
    "OAuth token document",
  );
  if (!before) return undefined;

  const parentStats = await inspectPath(
    fileSystem,
    parent,
    "OAuth token document directory",
  );
  if (!parentStats) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `OAuth token document parent is missing: ${parent}`,
    );
  }
  assertSecureDirectory(parentStats, parent);
  assertSecureFile(before, destination);

  let handle: FileHandle | undefined;
  try {
    handle = await fileSystem.open(destination, "r", 0o600);
    const opened = await handle.stat();
    assertSecureFile(opened, destination);
    if (before.dev !== opened.dev || before.ino !== opened.ino) {
      throw new OAuthTokenDocumentError(
        "unsafe_path",
        `OAuth token document changed while it was being opened: ${destination}`,
      );
    }

    const raw = await handle.readFile({ encoding: "utf8" });
    if (Buffer.byteLength(raw, "utf8") > OAUTH_TOKEN_DOCUMENT_MAX_BYTES) {
      throw new OAuthTokenDocumentError(
        "too_large",
        `OAuth token document exceeds ${OAUTH_TOKEN_DOCUMENT_MAX_BYTES} bytes: ${destination}`,
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new OAuthTokenDocumentError(
        "invalid_document",
        `OAuth token document is not valid JSON: ${destination}`,
        error,
      );
    }
    return validateTokenDocument(parsed);
  } catch (error) {
    if (error instanceof OAuthTokenDocumentError) throw error;
    throw ioError(`Unable to read OAuth token document: ${destination}`, error);
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

export async function writeOAuthTokenDocument(
  filePath: string,
  token: OAuthTokenResponse,
  options: OAuthTokenDocumentWriteOptions = {},
): Promise<void> {
  const destination = path.resolve(filePath);
  const parent = path.dirname(destination);
  const fileSystem = resolveFileSystem(options.fileSystem);
  const durability = options.durability ?? "required";
  const serialized = serializeOAuthTokenDocument(token);

  await ensureSecureParent(fileSystem, parent);

  const existing = await inspectPath(
    fileSystem,
    destination,
    "OAuth token document",
  );
  if (existing) {
    assertSecureFile(existing, destination);
    if (!options.overwrite) {
      throw new OAuthTokenDocumentError(
        "io_error",
        `OAuth token document already exists: ${destination}`,
      );
    }
  }

  const temporary = path.join(
    parent,
    `.${path.basename(destination)}.${process.pid}.${randomUUID()}.tmp`,
  );
  let temporaryExists = false;

  try {
    let handle: FileHandle;
    try {
      handle = await fileSystem.open(temporary, "wx", 0o600);
      temporaryExists = true;
    } catch (error) {
      throw ioError(
        `Unable to create temporary OAuth token document for: ${destination}`,
        error,
      );
    }

    try {
      await handle.writeFile(serialized, { encoding: "utf8" });
      await handle.sync();
    } catch (error) {
      throw ioError(
        `Unable to write temporary OAuth token document for: ${destination}`,
        error,
      );
    } finally {
      await handle.close();
    }

    if (process.platform !== "win32") {
      try {
        await fileSystem.chmod(temporary, 0o600);
      } catch (error) {
        throw ioError(
          `Unable to secure temporary OAuth token document for: ${destination}`,
          error,
        );
      }
    }

    const temporaryStats = await inspectPath(
      fileSystem,
      temporary,
      "temporary OAuth token document",
    );
    if (!temporaryStats) {
      throw new OAuthTokenDocumentError(
        "io_error",
        `Temporary OAuth token document disappeared before publication: ${destination}`,
      );
    }
    assertSecureFile(temporaryStats, temporary);

    try {
      if (options.overwrite) {
        await fileSystem.rename(temporary, destination);
        temporaryExists = false;
      } else {
        await fileSystem.link(temporary, destination);
        await fileSystem.unlink(temporary);
        temporaryExists = false;
      }
    } catch (error) {
      if (!options.overwrite && isErrno(error, "EEXIST")) {
        throw new OAuthTokenDocumentError(
          "io_error",
          `OAuth token document already exists: ${destination}`,
          error,
        );
      }
      throw ioError(
        `Unable to atomically publish OAuth token document: ${destination}`,
        error,
      );
    }

    await syncDirectory(fileSystem, parent, durability);
  } finally {
    if (temporaryExists) {
      await fileSystem.unlink(temporary).catch(() => undefined);
    }
  }
}

async function removeOAuthTokenDocument(
  filePath: string,
  options: OAuthTokenDocumentWriteOptions,
) {
  const destination = path.resolve(filePath);
  const parent = path.dirname(destination);
  const fileSystem = resolveFileSystem(options.fileSystem);
  const durability = options.durability ?? "required";
  const existing = await inspectPath(
    fileSystem,
    destination,
    "OAuth token document",
  );
  if (!existing) return;

  const parentStats = await inspectPath(
    fileSystem,
    parent,
    "OAuth token document directory",
  );
  if (!parentStats) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `OAuth token document parent is missing: ${parent}`,
    );
  }
  assertSecureDirectory(parentStats, parent);
  assertSecureFile(existing, destination);

  try {
    await fileSystem.unlink(destination);
  } catch (error) {
    if (!isErrno(error, "ENOENT")) {
      throw ioError(`Unable to delete OAuth token document: ${destination}`, error);
    }
  }
  await syncDirectory(fileSystem, parent, durability);
}

export class OAuthTokenDocumentSessionStore implements SessionStore {
  private readonly filePath: string;
  private readonly sessionKey: string;
  private readonly durability: OAuthTokenDocumentDurability;
  private readonly fileSystem?: Partial<OAuthTokenDocumentFileSystem>;
  private loadPromise?: Promise<void>;
  private mutationTail: Promise<void> = Promise.resolve();
  private value?: OAuthTokenResponse;
  private quarantinedCause?: unknown;

  constructor(options: OAuthTokenDocumentSessionStoreOptions) {
    if (!options.sessionKey.trim()) {
      throw new Error("OAuth token document session key must be nonempty.");
    }
    this.filePath = path.resolve(options.filePath);
    this.sessionKey = options.sessionKey;
    this.durability = options.durability ?? "required";
    this.fileSystem = options.fileSystem;
  }

  private assertKey(key: string) {
    if (key !== this.sessionKey) {
      throw new Error(
        "OAuth token document session store only accepts its configured session key.",
      );
    }
  }

  private assertHealthy() {
    if (this.quarantinedCause !== undefined) {
      throw new OAuthTokenDocumentError(
        "store_quarantined",
        "OAuth token document session store is quarantined after a persistence or load failure.",
        this.quarantinedCause,
      );
    }
  }

  private async ensureLoaded() {
    this.assertHealthy();
    if (!this.loadPromise) {
      this.loadPromise = readOAuthTokenDocument(this.filePath, {
        fileSystem: this.fileSystem,
      })
        .then((value) => {
          this.value = value;
        })
        .catch((error) => {
          this.quarantinedCause = error;
          throw error;
        });
    }
    await this.loadPromise;
    this.assertHealthy();
  }

  private enqueueMutation(operation: () => Promise<void>) {
    const result = this.mutationTail.then(async () => {
      this.assertHealthy();
      await this.ensureLoaded();
      try {
        await operation();
      } catch (error) {
        this.quarantinedCause = error;
        throw error;
      }
    });
    this.mutationTail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async get(key: string, _options?: GetOptions) {
    this.assertKey(key);
    await this.mutationTail;
    await this.ensureLoaded();
    return this.value ? { ...this.value } : undefined;
  }

  set(key: string, value: OAuthTokenResponse) {
    this.assertKey(key);
    const normalized = validateTokenDocument(value);
    return this.enqueueMutation(async () => {
      await writeOAuthTokenDocument(this.filePath, normalized, {
        overwrite: true,
        durability: this.durability,
        fileSystem: this.fileSystem,
      });
      this.value = normalized;
    });
  }

  del(key: string) {
    this.assertKey(key);
    return this.enqueueMutation(async () => {
      await removeOAuthTokenDocument(this.filePath, {
        durability: this.durability,
        fileSystem: this.fileSystem,
      });
      this.value = undefined;
    });
  }

  clear() {
    return this.enqueueMutation(async () => {
      await removeOAuthTokenDocument(this.filePath, {
        durability: this.durability,
        fileSystem: this.fileSystem,
      });
      this.value = undefined;
    });
  }
}
