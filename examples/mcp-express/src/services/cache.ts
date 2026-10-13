export interface CacheService {
  /** Return undefined when absent or expired. */
  get(key: string): Promise<unknown>;

  /** Store JSON data until expiresAt (Unix milliseconds). */
  set(key: string, value: unknown, expiresAt: number): Promise<void>;
}
