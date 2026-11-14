import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  Configuration,
  LeagueApi,
  ResultsApi,
} from "@iracing-data/api-client-fetch";
import { captureHistory } from "./commands/league-history/service.js";
import { resolveAccessToken } from "./credentials.js";
import type { CreateExecuteOptions } from "./commands/league-history/command.js";
import type {
  HistoryPage,
  HistoryQueries,
} from "./commands/league-history/contracts.js";

/** Reject unexpected payloads instead of silently producing incomplete captures. */
function page(document: unknown, field: string, idField: string): HistoryPage {
  if (!document || typeof document !== "object" || !(field in document)) {
    throw new Error(`League history response is missing ${field}.`);
  }

  const rows: unknown = (document as Record<string, unknown>)[field];

  if (!Array.isArray(rows)) {
    throw new Error(`League history ${field} must be an array.`);
  }

  const ids = rows.map((row: unknown) => {
    const id =
      row && typeof row === "object" && idField in row
        ? (row as Record<string, unknown>)[idField]
        : undefined;

    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
      throw new Error(`League history contains an invalid ${idField}.`);
    }

    return id;
  });

  return { document, ids };
}

/**
 * Fetch SDK adapter: bearer auth stays on API requests, never on cache downloads.
 * @param {string} accessToken - Validated bearer token without prefix.
 * @param {typeof fetch} fetcher - Host-selected networking implementation.
 * @returns {HistoryQueries} Materialized query operations with safe errors.
 */
export function createHistoryQueries(
  accessToken: string,
  fetcher: typeof fetch,
): HistoryQueries {
  const configuration = new Configuration({ accessToken, fetchApi: fetcher });

  const league = new LeagueApi(configuration);

  const results = new ResultsApi(configuration);

  const download = async (
    request: () => Promise<{ link: string }>,
  ): Promise<unknown> => {
    try {
      const envelope = await request();

      const url = new URL(envelope.link);

      if (url.protocol !== "https:") {
        throw new Error("Invalid cache protocol.");
      }

      const response = await fetcher(url);

      if (!response.ok) {
        throw new Error("Cache download failed.");
      }

      return await response.json();
    } catch {
      throw new Error(
        "League history request failed. Check connectivity, token expiry, iracing.auth scope, and league access.",
      );
    }
  };

  return {
    async seasons(leagueId, retired) {
      return page(
        await download(() =>
          league.getLeagueSeasons({
            league_id: leagueId,
            retired,
          }),
        ),
        "seasons",
        "season_id",
      );
    },
    async sessions(leagueId, seasonId) {
      return page(
        await download(() =>
          league.getLeagueSeasonSessions({
            league_id: leagueId,
            season_id: seasonId,
            results_only: true,
          }),
        ),
        "sessions",
        "subsession_id",
      );
    },
    results: (id) => download(() => results.getResults({ subsession_id: id })),
  };
}

/** Runtime-only dependencies selected explicitly by the root program. */
export interface HistoryRuntime {
  /** Host-selected network transport. */
  fetch: typeof fetch;

  /** Output policy overrides read at invocation time. */
  environment: { IRACING_OUTPUT_DIR?: string };

  /**
   * Read the host clock.
   * @returns {Date} Current instant.
   */
  now(): Date;

  /**
   * Render a safe completion receipt.
   * @param {unknown} document - Capture location and counts, never credentials.
   * @returns {void} Output is emitted synchronously.
   */
  display(document: unknown): void;
}

/**
 * Bind credentials, private files, networking and presentation outside the command.
 * @param {HistoryRuntime} runtime - Explicit host networking, output, clock and environment.
 * @returns {CreateExecuteOptions} Command-facing operations.
 */
export function createHistoryService(
  runtime: HistoryRuntime,
): CreateExecuteOptions {
  return {
    async capture(options) {
      const accessToken = await resolveAccessToken({
        credentials: options.credentials,
        accessToken: options.accessToken,
      });

      const directory = resolve(
        runtime.environment.IRACING_OUTPUT_DIR ??
          options.output ??
          `.iracing-data/league-${String(options.leagueId)}-${String(runtime.now().getTime())}`,
      );

      await mkdir(resolve(directory, ".."), { recursive: true, mode: 0o700 });

      // Exclusive directory creation prevents overwrites and stale success manifests.
      await mkdir(directory, { mode: 0o700 });
      const queries = createHistoryQueries(accessToken, runtime.fetch);

      const receipt = await captureHistory(
        options.leagueId,
        queries,
        {
          write: (name, document) =>
            writeFile(
              join(directory, `${name}.json`),
              `${JSON.stringify(document, null, 2)}\n`,
              { mode: 0o600, flag: "wx" },
            ),
        },
        () => runtime.now(),
      );

      return { directory, ...receipt };
    },
    present: (receipt) => {
      runtime.display(receipt);
    },
  };
}
