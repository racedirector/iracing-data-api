import type {
  HistoryCapture,
  HistoryQueries,
  HistoryReceipt,
} from "./contracts.js";

/**
 * Capture completed league history sequentially. A manifest is the completion marker;
 * failed runs retain partial evidence but never receive a completion manifest.
 * @param {number} leagueId - Validated league identifier.
 * @param {HistoryQueries} queries - Materialized history query operations.
 * @param {HistoryCapture} capture - Invocation-owned persistence destination.
 * @param {() => Date} now - Clock for the completion timestamp.
 * @returns {Promise<HistoryReceipt>} Counts after every document is persisted.
 */
export async function captureHistory(
  leagueId: number,
  queries: HistoryQueries,
  capture: HistoryCapture,
  now: () => Date,
): Promise<HistoryReceipt> {
  const seasons = new Set<number>();

  const subsessions = new Set<number>();

  for (const retired of [false, true]) {
    const page = await queries.seasons(leagueId, retired);

    await capture.write(
      `seasons-${retired ? "retired" : "active"}`,
      page.document,
    );
    for (const id of page.ids) {
      seasons.add(id);
    }
  }

  for (const id of seasons) {
    const page = await queries.sessions(leagueId, id);

    await capture.write(`season-${String(id)}-sessions`, page.document);
    for (const subsession of page.ids) {
      subsessions.add(subsession);
    }
  }

  for (const id of subsessions) {
    await capture.write(`results-${String(id)}`, await queries.results(id));
  }

  await capture.write("manifest", {
    league_id: leagueId,
    captured_at: now().toISOString(),
    season_ids: [...seasons],
    subsession_ids: [...subsessions],
  });

  return { leagueId, seasons: seasons.size, results: subsessions.size };
}
