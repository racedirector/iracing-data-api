/** Validated command input; environment and credential policy belong to composition. */
export interface HistoryOptions {
  /** Positive iRacing league identifier. */
  leagueId: number;

  /** Optional new capture directory. */
  output?: string;

  /** Optional credential document path. */
  credentials?: string;

  /** Optional direct bearer token; never include in presentation or captures. */
  accessToken?: string;
}

/** A materialized API document plus the identifiers needed for traversal. */
export interface HistoryPage {
  /** Full materialized upstream payload. */
  document: unknown;

  /** Validated identifiers for subsequent queries. */
  ids: number[];
}

/** Network-independent query port. Implementations materialize cache links internally. */
export interface HistoryQueries {
  /**
   * Read one season collection.
   * @param {number} leagueId - League to inspect.
   * @param {boolean} retired - Whether to select retired seasons.
   * @returns {Promise<HistoryPage>} Full document and season IDs.
   */
  seasons(leagueId: number, retired: boolean): Promise<HistoryPage>;

  /**
   * Read completed sessions.
   * @param {number} leagueId - Owning league.
   * @param {number} seasonId - League season.
   * @returns {Promise<HistoryPage>} Full document and subsession IDs.
   */
  sessions(leagueId: number, seasonId: number): Promise<HistoryPage>;

  /**
   * Read complete results.
   * @param {number} subsessionId - Completed subsession.
   * @returns {Promise<unknown>} Materialized results document.
   */
  results(subsessionId: number): Promise<unknown>;
}

/** Private capture destination, owned for the lifetime of one invocation. */
export interface HistoryCapture {
  /**
   * Save one document, rejecting write failures.
   * @param {string} name - Service-owned capture basename.
   * @param {unknown} document - Materialized API evidence.
   * @returns {Promise<void>} Completion after persistence.
   */
  write(name: string, document: unknown): Promise<void>;
}

/** Completion receipt; presentation decides how to display it. */
export interface HistoryReceipt {
  /** Captured league. */
  leagueId: number;

  /** Distinct seasons discovered. */
  seasons: number;

  /** Distinct results captured. */
  results: number;
}
