/**
 * Secure bare OAuthTokenResponse document and single-key durable SessionStore.
 *
 * The on-disk document is compatible with CLI JSON credential output, not a generic
 * key/value envelope. Missing documents return undefined; corrupt, unsafe, oversized
 * or unreadable state fails distinctly. Validate full token shape and a bounded
 * serialized size. On POSIX the credential directory must be current-user-owned
 * 0700, and the document a regular non-symlink current-user-owned 0600 file.
 * Windows APIs do not establish equivalent ownership/mode security; host ACLs apply.
 *
 * Writes use an exclusive same-directory temporary file, file fsync, link or rename
 * publication, and parent-directory fsync. Required directory durability is default;
 * best-effort is an explicit portability choice, not Linux crash-durability evidence.
 * A failure after rename may have published replacement bytes: never assume rollback
 * to the previous refresh token is safe. Removal also syncs directory state.
 *
 * The store accepts one configured key, loads once and serializes local mutations.
 * Publish in-memory state only after successful durable mutation; load/mutation
 * failure quarantines this instance so later operations cannot reuse stale state.
 * Repair requires a new instance after underlying credential state is repaired.
 * There is no distributed/process lock, file watch, replica coordination or hot
 * replacement. One owner per directory is an operational prerequisite. Backups of
 * consumed refresh tokens are not recovery credentials. Error causes/paths are
 * internal diagnostics data, not safe outward messages.
 */
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

/** Maximum accepted UTF-8 credential-document size in bytes. */
export const OAUTH_TOKEN_DOCUMENT_MAX_BYTES = 64 * 1024;

/**
 * Directory-sync policy for credential persistence: required fails when durable publication
 * cannot be proven, while best-effort tolerates unsupported directory fsync.
 */
export type OAuthTokenDocumentDurability = "required" | "best-effort";

/**
 * Stable failure classifications for secure token-document validation, reading, and
 * publication.
 */
export type OAuthTokenDocumentErrorCode =
  | "invalid_document"
  | "unsafe_path"
  | "too_large"
  | "io_error"
  | "durability_unsupported"
  | "store_quarantined";

/**
 * Token-document failure carrying structured classification and trusted diagnostic context
 * without changing the public token shape.
 */
export class OAuthTokenDocumentError extends Error {
  /**
   * Creates a classified token-document failure with its trusted diagnostic cause.
   * @param {OAuthTokenDocumentErrorCode} code - Stable classification used to distinguish this failure.
   * @param {string} message - Human-readable explanation retained on the failure.
   * @param {unknown} cause - Original failure retained only for trusted diagnostics.
   */
  constructor(
    public readonly code: OAuthTokenDocumentErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "OAuthTokenDocumentError";
  }
}

/**
 * Injectable filesystem surface used by the secure token-document owner so host behavior and
 * failure cases can be tested deterministically.
 */
export interface OAuthTokenDocumentFileSystem {
  /**
   * Changes filesystem permission bits for a credential path.
   * @param {string} path - Filesystem or protected-resource path used by this operation.
   * @param {number} mode - POSIX permission bits requested for the filesystem entry.
   * @returns {Promise<void>} Completion of the requested operation.
   */
  chmod(path: string, mode: number): Promise<void>;

  /**
   * Publishes a file through an exclusive hard link without replacing an existing destination.
   * @param {string} existingPath - Existing file used as the source of the hard link.
   * @param {string} newPath - Destination path for the new hard link.
   * @returns {Promise<void>} Completion of the requested operation.
   */
  link(existingPath: string, newPath: string): Promise<void>;

  /**
   * Reads path metadata without following symbolic links.
   * @param {string} path - Filesystem or protected-resource path used by this operation.
   * @returns {ReturnType<typeof lstat>} Filesystem metadata for the entry without following symbolic links.
   */
  lstat(path: string): ReturnType<typeof lstat>;

  /**
   * Creates the credential directory using the supplied filesystem options.
   * @param {string} path - Filesystem or protected-resource path used by this operation.
   * @param {Parameters<typeof mkdir>[1]} options - Configuration and injected capabilities for this operation.
   * @returns {ReturnType<typeof mkdir>} Filesystem directory-creation result.
   */
  mkdir(
    path: string,
    options: Parameters<typeof mkdir>[1],
  ): ReturnType<typeof mkdir>;

  /**
   * Opens a credential file with the requested flags and permission bits.
   * @param {string} path - Filesystem or protected-resource path used by this operation.
   * @param {string} flags - Filesystem open flags governing creation and access.
   * @param {number} mode - POSIX permission bits requested for the filesystem entry.
   * @returns {Promise<FileHandle>} File handle for the requested access mode.
   */
  open(path: string, flags: string, mode: number): Promise<FileHandle>;

  /**
   * Atomically replaces the destination with the prepared file on the same filesystem.
   * @param {string} oldPath - Prepared source path to publish at the destination.
   * @param {string} newPath - Destination path for the new hard link.
   * @returns {Promise<void>} Completion of the requested operation.
   */
  rename(oldPath: string, newPath: string): Promise<void>;

  /**
   * Removes a file or symbolic-link directory entry.
   * @param {string} path - Filesystem or protected-resource path used by this operation.
   * @returns {Promise<void>} Completion of the requested operation.
   */
  unlink(path: string): Promise<void>;
}

/** Node filesystem implementation used by default for secure token persistence. */
export const oauthTokenDocumentFileSystem: OAuthTokenDocumentFileSystem = {
  chmod,
  link,
  lstat,
  mkdir,
  open,
  rename,
  unlink,
};

/** Read-time filesystem seam for hardened credential loading. */
export interface OAuthTokenDocumentReadOptions {
  /** Filesystem operations supplied by the host for persistence. */
  fileSystem?: Partial<OAuthTokenDocumentFileSystem>;
}

/** Credential-write policy extending secure reads with overwrite and durability controls. */
export type OAuthTokenDocumentWriteOptions = OAuthTokenDocumentReadOptions & {
  overwrite?: boolean;
  durability?: OAuthTokenDocumentDurability;
};

/**
 * Configuration for binding the hardened single-document token store to exactly one logical
 * OAuth session key.
 */
export interface OAuthTokenDocumentSessionStoreOptions {
  /** Path of the persisted token or key-value document. */
  filePath: string;

  /** Single session identifier accepted by this durable store. */
  sessionKey: string;

  /** Requested file and directory synchronization policy. */
  durability?: OAuthTokenDocumentDurability;

  /** Filesystem operations supplied by the host for persistence. */
  fileSystem?: Partial<OAuthTokenDocumentFileSystem>;
}

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
  if (cause instanceof OAuthTokenDocumentError) {
    return cause;
  }

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
    if (isErrno(error, "ENOENT")) {
      return undefined;
    }

    throw ioError(`Unable to inspect ${description}: ${target}`, error);
  }
}

function assertPosixOwnershipAndMode(
  stats: FileStats,
  target: string,
  expectedMode: number,
  description: string,
) {
  if (process.platform === "win32") {
    return;
  }

  const uid =
    typeof process.getuid === "function" ? process.getuid() : undefined;

  if (uid !== undefined && stats.uid !== uid) {
    throw new OAuthTokenDocumentError(
      "unsafe_path",
      `${description} is not owned by the current user: ${target}`,
    );
  }

  const mode = Number(stats.mode) & 0o777;

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
      `OAuth token document exceeds ${String(OAUTH_TOKEN_DOCUMENT_MAX_BYTES)} bytes: ${target}`,
    );
  }

  assertPosixOwnershipAndMode(stats, target, 0o600, "OAuth token document");
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

  if (token.refresh_token !== undefined && !token.refresh_token.trim()) {
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

/**
 * Validates token invariants and emits the canonical bounded JSON credential document used for
 * durable persistence.
 * @param {OAuthTokenResponse} token - OAuth credential or command document to serialize.
 * @returns {string} Validated JSON credential document ending with a newline.
 * @throws {OAuthTokenDocumentError} If the token is invalid or its serialized document exceeds the size limit.
 */
export function serializeOAuthTokenDocument(token: OAuthTokenResponse): string {
  const normalized = validateTokenDocument(token);

  const serialized = `${JSON.stringify(normalized, null, 2)}\n`;

  if (Buffer.byteLength(serialized, "utf8") > OAUTH_TOKEN_DOCUMENT_MAX_BYTES) {
    throw new OAuthTokenDocumentError(
      "too_large",
      `OAuth token document exceeds ${String(OAUTH_TOKEN_DOCUMENT_MAX_BYTES)} bytes.`,
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
    if (durability === "best-effort") {
      return;
    }

    throw new OAuthTokenDocumentError(
      "durability_unsupported",
      `Unable to durably synchronize OAuth token document directory: ${directory}`,
      error,
    );
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

/**
 * Loads a credential document only after validating parent/file ownership, file type, inode
 * stability, size, JSON shape, and token invariants.
 * @param {string} filePath - Path to the persisted OAuth credential document.
 * @param {OAuthTokenDocumentReadOptions} options - Configuration and injected capabilities for this operation.
 * @returns {Promise<OAuthTokenResponse | undefined>} Validated credentials, or undefined when the document is absent.
 */
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

  if (!before) {
    return undefined;
  }

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

    return parseTokenDocument(raw, destination);
  } catch (error) {
    if (error instanceof OAuthTokenDocumentError) {
      throw error;
    }

    throw ioError(`Unable to read OAuth token document: ${destination}`, error);
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

/**
 * Publishes credentials through an exclusive temporary file and atomic replacement, enforcing
 * overwrite and requested durability semantics.
 * @param {string} filePath - Path to the persisted OAuth credential document.
 * @param {OAuthTokenResponse} token - OAuth credential or command document to serialize.
 * @param {OAuthTokenDocumentWriteOptions} options - Configuration and injected capabilities for this operation.
 * @returns {Promise<void>} Completion after secure publication and requested synchronization.
 */
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

  await checkTokenDestination(fileSystem, destination, options.overwrite);

  const temporary = path.join(
    parent,
    `.${path.basename(destination)}.${String(process.pid)}.${randomUUID()}.tmp`,
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

    await writeAndSyncDocument(handle, serialized, destination);

    await secureTemporaryDocument(fileSystem, temporary, destination);

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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Exceptional write and publication paths reach finally before the temporary-file flag is cleared.
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

  if (!existing) {
    return;
  }

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
      throw ioError(
        `Unable to delete OAuth token document: ${destination}`,
        error,
      );
    }
  }

  await syncDirectory(fileSystem, parent, durability);
}

/**
 * Single-session store that lazily loads hardened token state, serializes mutations, and
 * quarantines itself after persistence or load failures.
 */
export class OAuthTokenDocumentSessionStore implements SessionStore {
  private readonly filePath: string;
  private readonly sessionKey: string;
  private readonly durability: OAuthTokenDocumentDurability;
  private readonly fileSystem?: Partial<OAuthTokenDocumentFileSystem>;
  private loadPromise?: Promise<void>;
  private mutationTail: Promise<void> = Promise.resolve();
  private value?: OAuthTokenResponse;
  private quarantinedCause?: unknown;

  /**
   * Creates a durable store accepting only the configured nonempty session key.
   * @param {OAuthTokenDocumentSessionStoreOptions} options - Configuration and injected capabilities for this operation.
   * @throws {Error} If the durable store is configured with an empty session key.
   */
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
    this.loadPromise ??= readOAuthTokenDocument(this.filePath, {
      fileSystem: this.fileSystem,
    })
      .then((value) => {
        this.value = value;
      })
      .catch((error: unknown) => {
        this.quarantinedCause = error;
        throw error;
      });

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

  /**
   * Reads the value associated with a key without creating a missing entry. Persistence failures propagate to the caller.
   * @param {string} key - Identifier of the stored value to read or mutate.
   * @param {GetOptions} _options - Optional cooperative read controls supported by the store interface.
   * @returns {Promise<OAuthTokenResponse | undefined>} Stored value, or undefined when no entry exists.
   */
  async get(key: string, _options?: GetOptions) {
    this.assertKey(key);
    await this.mutationTail;
    await this.ensureLoaded();

    return this.value ? { ...this.value } : undefined;
  }

  /**
   * Stores the supplied value under its key. Persistence failures propagate to the caller.
   * @param {string} key - Identifier of the stored value to read or mutate.
   * @param {OAuthTokenResponse} value - Input value to validate, store, or serialize.
   * @returns {Promise<void>} Completion of the store mutation.
   */
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

  /**
   * Deletes the stored value associated with a key. Persistence failures propagate to the caller.
   * @param {string} key - Identifier of the stored value to read or mutate.
   * @returns {Promise<void>} Completion of the store deletion.
   */
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

  /**
   * Removes all values owned by this store. Persistence failures propagate to the caller.
   * @returns {Promise<void>} Completion of clearing this store.
   */
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

async function secureTemporaryDocument(
  fileSystem: OAuthTokenDocumentFileSystem,
  temporary: string,
  destination: string,
) {
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
}

async function checkTokenDestination(
  fileSystem: OAuthTokenDocumentFileSystem,
  destination: string,
  overwrite: boolean | undefined,
) {
  const existing = await inspectPath(
    fileSystem,
    destination,
    "OAuth token document",
  );

  if (existing) {
    assertSecureFile(existing, destination);
    if (!overwrite) {
      throw new OAuthTokenDocumentError(
        "io_error",
        `OAuth token document already exists: ${destination}`,
      );
    }
  }
}

function parseTokenDocument(raw: string, destination: string) {
  if (Buffer.byteLength(raw, "utf8") > OAUTH_TOKEN_DOCUMENT_MAX_BYTES) {
    throw new OAuthTokenDocumentError(
      "too_large",
      `OAuth token document exceeds ${String(OAUTH_TOKEN_DOCUMENT_MAX_BYTES)} bytes: ${destination}`,
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
}

async function writeAndSyncDocument(
  handle: FileHandle,
  serialized: string,
  destination: string,
) {
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
}
