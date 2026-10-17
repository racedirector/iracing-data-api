export interface CacheResolverOptions {
  signal?: AbortSignal;
}

export interface CacheResolver {
  /**
   * Return undefined when no unexpired entry exists.
   *
   * Backend failures are best-effort and behave as a miss.
   * Request cancellation must still propagate.
   */
  get(
    key: string,
    options?: CacheResolverOptions,
  ): Promise<unknown | undefined>;

  /**
   * Store a value until the absolute Unix-millisecond.
   *
   * Backend failures are best-effort and must not fail the operation.
   * Request cancellation must still propagate.
   */
  set(
    key: string,
    value: unknown,
    expiresAt: number,
    options?: CacheResolverOptions,
  ): Promise<void>;
}
