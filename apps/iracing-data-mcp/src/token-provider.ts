/**
 * Resolve a current iRacing access token for an already selected account.
 * Implementations own storage, refresh rotation and persistence. A host may
 * close over a verified actor's linked account; this contract does not verify
 * incoming callers or choose a different account when credentials are missing.
 * @returns {Promise<string>} Current access token for the selected account.
 */
export type AccessTokenProvider = () => Promise<string>;
