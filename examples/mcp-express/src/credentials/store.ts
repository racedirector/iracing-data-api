import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  OAuthTokenResponseSchema,
  type GetOptions,
  type OAuthTokenResponse,
  type SessionStore,
} from "@iracing-data/oauth-client";

/** Stores one session as the bare JSON token document written by the auth CLI. */
export class FileSessionStore implements SessionStore {
  constructor(
    readonly filePath: string,
    readonly sessionId = "local",
  ) {
    console.error("Initialized with:", filePath);
  }

  async get(
    key: string,
    options?: GetOptions,
  ): Promise<OAuthTokenResponse | undefined> {
    if (key !== this.sessionId) return undefined;

    let document: string;
    try {
      document = await readFile(this.filePath, {
        encoding: "utf8",
        signal: options?.signal,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }

    return OAuthTokenResponseSchema.parse(JSON.parse(document));
  }

  async set(key: string, token: OAuthTokenResponse): Promise<void> {
    if (key !== this.sessionId)
      throw new Error("Unknown credential session ID");

    const document =
      JSON.stringify(OAuthTokenResponseSchema.parse(token), null, 2) + "\n";

    await mkdir(dirname(this.filePath), { recursive: true, mode: 0o700 });

    const temporary = `${this.filePath}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, document, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      });
      await rename(temporary, this.filePath);
    } finally {
      await rm(temporary, { force: true });
    }
  }

  async del(key: string): Promise<void> {
    if (key === this.sessionId) await rm(this.filePath, { force: true });
  }
}

export interface CreateFileSessionStoreOptions {
  filePath: string;
  sessionId?: string;
}

export function createFileSessionStore({
  filePath,
  sessionId,
}: CreateFileSessionStoreOptions) {
  return new FileSessionStore(filePath, sessionId);
}

export function createFileSessionStoreFromEnv({
  env,
}: {
  env: NodeJS.ProcessEnv;
}) {
  return createFileSessionStore({ filePath: env.MCP_CREDENTIAL_FILE! });
}

export function createDefaultFileSessionStore() {
  return createFileSessionStoreFromEnv({ env: process.env });
}
