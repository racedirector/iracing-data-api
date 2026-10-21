export interface CacheStore {
  get(
    key: string,
    options?: { signal?: AbortSignal },
  ): Promise<unknown | undefined>;

  set(
    key: string,
    value: unknown,
    expiresAt: number,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
}
