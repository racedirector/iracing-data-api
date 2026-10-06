import {
  CarApi,
  Configuration,
  ConstantsApi,
  DocApi,
  LookupApi,
  MemberApi,
  ResultsApi,
  SeriesApi,
  StatsApi,
  TrackApi,
  type ApiResponse,
  type GetLookupDriversRequest,
  type GetResultsRequest,
  type GetResultsSearchSeriesRequest,
  type GetSeriesSeasonListRequest,
  type GetSeriesSeasonScheduleRequest,
  type GetStatsMemberRecentRacesRequest,
} from "@iracing-data/api-client-fetch";
import {
  LookupDriversParametersSchema,
  ResultsGetParametersSchema,
  ResultsSearchSeriesParametersSchema,
  SeriesSeasonListParametersSchema,
  SeriesSeasonScheduleParametersSchema,
  StatsMemberRecentRacesParametersSchema,
} from "@iracing-data/api-schema";
import { z } from "zod";
import {
  ApplicationFailure,
  createRequestContext,
  errorEnvelope,
} from "../diagnostics/errors.js";
import { createDiagnosticLogger } from "../diagnostics/logging.js";
import { mapFailure } from "../diagnostics/mapping.js";
import {
  arrayPayload,
  directSchemas,
  parse,
  parseEnvelope,
  parseManifest,
  payloadSchemas,
} from "./parsers.js";
import {
  API_ORIGIN,
  cacheUrl,
  chunkUrl,
  GATEWAY_LIMITS,
  invalidData,
  retryAfter,
  unsafeLink,
} from "./policy.js";
import { createGatewayTransport, type GatewayTransport } from "./transport.js";

export interface GatewayOptions {
  readonly configuration: Configuration;
  readonly authorizationState?: () => string;

  /** Offline seam only. Production uses DNS-pinned HTTPS for API and cache. */
  readonly transport?: GatewayTransport;
  readonly now?: () => number;
  readonly logger?: ReturnType<typeof createDiagnosticLogger>;
}
interface CallState {
  signal: AbortSignal;
  bytes: number;
  fetches: number;
  expiry: number;
  pending: Map<string, Promise<unknown>>;
}

/** App-internal handle. It contains no signed URL and is not a model-facing cursor. */
export interface GatewaySearch {
  readonly totalRows: number;
  readonly chunks: number;
  readonly expiresAt: number;
}
interface SharedFetch {
  controller: AbortController;
  consumers: Set<{ state: CallState; reject: (error: unknown) => void }>;
  promise: Promise<Response>;
  received: number;
}
interface SearchState {
  info: ReturnType<typeof parseManifest>;
  expiry: number;
  bytes: number;
  cache: Map<
    number,
    { rows: readonly Record<string, unknown>[]; bytes: number }
  >;
}

/** Create a RATE_LIMITED failure with a one-second retry hint. */
function capacity() {
  return new ApplicationFailure("RATE_LIMITED", { retry_after_seconds: 1 });
}

/** Create a CURSOR_EXPIRED failure for an expired or missing search. */
function expired() {
  return new ApplicationFailure("CURSOR_EXPIRED", {
    reason: "expired_or_evicted",
  });
}

/** Create an UPSTREAM_UNAVAILABLE failure without upstream details. */
function unavailable() {
  return new ApplicationFailure("UPSTREAM_UNAVAILABLE");
}

/** One shared gateway per application/session owner; no persistent cache or tool registration. */
export class DataApiGateway {
  readonly #options: GatewayOptions;
  readonly #transport: GatewayTransport;
  readonly #now: () => number;
  readonly #logger: ReturnType<typeof createDiagnosticLogger>;
  readonly #inflight = new Map<string, SharedFetch>();
  readonly #searches = new Map<GatewaySearch, SearchState>();
  #generation = 0;

  /** Account-owner invalidation epoch for app-local projected cursors. */
  get generation(): number {
    return this.#generation;
  }
  #activeCalls = 0;
  #network = 0;
  #cooldown = 0;
  #retained = 0;

  /** Create a session-local gateway; a noncanonical API base URL throws CONFIGURATION_ERROR. */
  constructor(options: GatewayOptions) {
    if (options.configuration.basePath !== API_ORIGIN) {
      throw new ApplicationFailure("CONFIGURATION_ERROR");
    }

    this.#options = options;
    this.#transport = options.transport ?? createGatewayTransport();
    this.#now = options.now ?? Date.now;
    this.#logger = options.logger ?? createDiagnosticLogger();
  }

  /** Discard retained searches and chunks so their handles can no longer be used. */
  invalidate(): void {
    this.#generation++;
    this.#searches.clear();
    this.#retained = 0;
  }

  /** Remove a search and release its retained byte budget; unknown handles are ignored. */
  #drop(handle: GatewaySearch) {
    const search = this.#searches.get(handle);

    if (!search) {
      return;
    }

    this.#retained -= search.bytes;
    for (const cached of search.cache.values()) {
      this.#retained -= cached.bytes;
    }

    this.#searches.delete(handle);
  }

  /** Release searches whose expiry is at or before the current gateway time. */
  #prune() {
    for (const [handle, search] of this.#searches) {
      if (search.expiry <= this.#now()) {
        this.#drop(handle);
      }
    }
  }

  /** Invalidate searches and throw AUTHORIZATION_REQUIRED when configured state is not ready. */
  #checkAuth() {
    if (
      this.#options.authorizationState &&
      this.#options.authorizationState() !== "ready"
    ) {
      this.invalidate();
      throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
    }
  }

  /**
   * Run authorized work within eight fetches, 16 MiB of decoded data, and 30 seconds.
   * Tool slices compose all their work here; the supplied call expires when withCall settles.
   * Returns the work result. A signal abort or deadline during work rejects with
   * UPSTREAM_UNAVAILABLE; excess admission rejects promptly with RATE_LIMITED.
   * Propagates ApplicationFailure errors, including token refresh failures, and maps
   * other work errors through the upstream failure policy. Failed token acquisition
   * invalidates retained searches. Cancellation does not stop an ongoing token refresh.
   */
  async withCall<T>(
    work: (call: GatewayCall) => Promise<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    this.#checkAuth();
    this.#prune();
    if (this.#activeCalls >= GATEWAY_LIMITS.calls) {
      throw capacity();
    }

    this.#activeCalls++;
    const controller = new AbortController();

    const abort = () => controller.abort();

    if (signal?.aborted) {
      abort();
    }

    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(abort, GATEWAY_LIMITS.deadlineMs);

    const state: CallState = {
      signal: controller.signal,
      bytes: 0,
      fetches: 0,
      expiry: this.#now() + GATEWAY_LIMITS.cursorTtlMs,
      pending: new Map(),
    };

    let rejectAbort: (() => void) | undefined;

    try {
      controller.signal.throwIfAborted();
      const canceled = new Promise<never>((_resolve, reject) => {
        rejectAbort = () => reject(unavailable());
        controller.signal.addEventListener("abort", rejectAbort, {
          once: true,
        });
      });

      const authorized = async () => {
        const provider = this.#options.configuration.accessToken;

        if (!provider) {
          throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
        }

        try {
          if (!(await provider("bearerAuth", []))) {
            throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
          }
        } catch (error) {
          this.invalidate();
          throw error;
        }

        state.signal.throwIfAborted();
        this.#checkAuth();

        return await work(this.#call(state));
      };

      return await Promise.race([authorized(), canceled]);
    } catch (error) {
      throw error instanceof ApplicationFailure
        ? error
        : mapFailure(error, { domain: "upstream" });
    } finally {
      if (rejectAbort) {
        controller.signal.removeEventListener("abort", rejectAbort);
      }

      controller.abort();
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      this.#activeCalls--;
    }
  }

  /**
   * Fetch an allowed API/cache URL, sharing in-flight downloads by URL and authorization.
   * Each consumer pays its own fetch/decoded-byte budget and receives a response clone.
   * Reject with RATE_LIMITED during cooldown or at network capacity, or
   * RESPONSE_LIMIT_EXCEEDED when the call budget is exhausted. The last departing
   * consumer aborts the download; download failures propagate to remaining consumers.
   */
  async #fetch(
    state: CallState,
    input: string,
    init: RequestInit,
    cache: boolean,
  ): Promise<Response> {
    state.signal.throwIfAborted();
    this.#checkAuth();
    const url = cache ? cacheUrl(input) : new URL(input);

    if (
      !cache &&
      (url.origin !== API_ORIGIN ||
        !url.pathname.startsWith("/data/") ||
        url.username ||
        url.password ||
        url.hash)
    ) {
      unsafeLink();
    }

    if (this.#now() < this.#cooldown) {
      throw new ApplicationFailure("RATE_LIMITED", {
        retry_after_seconds: (this.#cooldown - this.#now()) / 1000,
      });
    }

    if (state.fetches >= GATEWAY_LIMITS.fetches) {
      throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
    }

    state.fetches++;

    // Account token is internal to this short-lived key; it is never logged or returned.
    const key =
      input +
      "\n" +
      (cache ? "cache" : new Headers(init.headers).get("authorization"));

    let shared = this.#inflight.get(key);

    if (!shared) {
      if (this.#network >= GATEWAY_LIMITS.networkOperations) {
        throw capacity();
      }

      this.#network++;
      const controller = new AbortController();

      const owner: CallState = {
        signal: controller.signal,
        bytes: 0,
        fetches: 0,
        expiry: this.#now() + GATEWAY_LIMITS.cursorTtlMs,
        pending: new Map(),
      };

      const created: SharedFetch = {
        controller,
        consumers: new Set(),
        received: 0,
        promise: Promise.resolve(new Response()),
      };

      shared = created;
      this.#inflight.set(key, created);
      created.promise = Promise.resolve().then(() =>
        this.#download(owner, url, init, cache, (bytes) => {
          created.received += bytes;
          for (const consumer of created.consumers) {
            consumer.state.bytes += bytes;
            if (consumer.state.bytes > GATEWAY_LIMITS.callBytes) {
              created.consumers.delete(consumer);
              consumer.reject(
                new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED"),
              );
            }
          }

          if (!created.consumers.size) {
            controller.abort();
          }
        }),
      );
      void created.promise
        .finally(() => {
          if (this.#inflight.get(key) === created) {
            this.#inflight.delete(key);
          }
        })
        .catch(() => undefined);
    }

    state.bytes += shared.received;
    if (state.bytes > GATEWAY_LIMITS.callBytes) {
      throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
    }

    const pending = shared;

    let rejectConsumer!: (error: unknown) => void;

    const canceled = new Promise<never>((_resolve, reject) => {
      rejectConsumer = reject;
    });

    const consumer = { state, reject: rejectConsumer };

    pending.consumers.add(consumer);
    const abort = () => rejectConsumer(unavailable());

    state.signal.addEventListener("abort", abort, { once: true });
    try {
      return (await Promise.race([pending.promise, canceled])).clone();
    } finally {
      state.signal.removeEventListener("abort", abort);
      pending.consumers.delete(consumer);
      if (!pending.consumers.size) {
        pending.controller.abort();
        if (this.#inflight.get(key) === pending) {
          this.#inflight.delete(key);
        }
      }
    }
  }

  /**
   * Buffer one decoded response within 8 MiB and a ten-second timeout.
   * Cache requests carry no authorization; API requests require a Bearer token.
   * Report decoded byte increments to onBytes. Reject redirects and invalid bodies,
   * map cache 403/404 to CURSOR_EXPIRED, and establish shared cooldown on 429.
   * Preserve ApplicationFailure errors; convert other transport/body errors to
   * UPSTREAM_UNAVAILABLE. Release the reserved network slot on completion or failure.
   */
  async #download(
    state: CallState,
    url: URL,
    init: RequestInit,
    cache: boolean,
    onBytes: (bytes: number) => void,
  ): Promise<Response> {
    if (state.signal.aborted) {
      this.#network--;
      throw unavailable();
    }

    const controller = new AbortController();

    const abort = () => controller.abort();

    state.signal.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(abort, GATEWAY_LIMITS.fetchTimeoutMs);

    const context = createRequestContext();

    const started = this.#now();

    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

    let upstream: Response | undefined;

    try {
      // Deliberately discard configuration/caller headers, cookies, middleware and credentials.
      const headers = new Headers({ accept: "application/json" });

      if (!cache) {
        const authorization = new Headers(init.headers).get("authorization");

        if (!authorization?.startsWith("Bearer ")) {
          throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
        }

        headers.set("authorization", authorization);
      }

      const canceled = new Promise<never>((_resolve, reject) =>
        controller.signal.addEventListener(
          "abort",
          () => reject(unavailable()),
          { once: true },
        ),
      );

      const response = await Promise.race([
        this.#transport(url, {
          method: "GET",
          headers,
          credentials: "omit",
          redirect: "error",
          signal: controller.signal,
        }),
        canceled,
      ]);

      upstream = response;
      this.#logger.log("debug", context, {
        operation: cache ? "cache_fetch" : "data_api",
        status: response.status,
      });
      if (
        response.redirected ||
        (response.status >= 300 && response.status < 400)
      ) {
        unsafeLink();
      }

      if (response.status === 429) {
        const seconds = retryAfter(
          response.headers.get("retry-after"),
          this.#now(),
        );

        this.#cooldown = Math.max(
          this.#cooldown,
          this.#now() + Math.max(1, seconds) * 1000,
        );
        throw new ApplicationFailure("RATE_LIMITED", {
          retry_after_seconds: Math.max(1, seconds),
        });
      }

      if (!response.ok) {
        if (cache && (response.status === 403 || response.status === 404)) {
          throw expired();
        }

        if (!cache && (response.status === 401 || response.status === 403)) {
          throw new ApplicationFailure("UPSTREAM_UNAUTHORIZED", {
            reason: "upstream_access_denied",
          });
        }

        if (response.status === 404) {
          throw new ApplicationFailure("NOT_FOUND");
        }

        throw response.status >= 500 || response.status === 408
          ? unavailable()
          : new ApplicationFailure("DATA_RESOLUTION_FAILED", {
              reason: "invalid_data",
            });
      }

      if (!response.body) {
        invalidData();
      }

      reader = response.body.getReader();
      const parts: Uint8Array[] = [];

      let bytes = 0;

      for (;;) {
        const item = await Promise.race([reader.read(), canceled]);

        if (item.done) {
          break;
        }

        bytes += item.value.byteLength;
        onBytes(item.value.byteLength);
        if (bytes > GATEWAY_LIMITS.responseBytes) {
          throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
        }

        parts.push(item.value);
      }

      this.#checkAuth();
      state.signal.throwIfAborted();
      this.#logger.log("debug", context, {
        operation: cache ? "cache_fetch" : "data_api",
        bytes,
        elapsed_ms: Math.max(0, this.#now() - started),
      });

      // The generated converter can only see a fully bounded, decoded body.
      return new Response(Buffer.concat(parts), {
        status: response.status,
        headers: { "content-type": "application/json" },
      });
    } catch (error) {
      const safe = error instanceof ApplicationFailure ? error : unavailable();

      this.#logger.failure(context, safe, {
        operation: cache ? "cache_fetch" : "data_api",
      });
      throw safe;
    } finally {
      if (reader) {
        void reader.cancel().catch(() => undefined);
      } else if (upstream?.body) {
        void upstream.body.cancel().catch(() => undefined);
      }

      controller.abort();
      clearTimeout(timer);
      state.signal.removeEventListener("abort", abort);
      this.#network--;
    }
  }

  /** Create operations sharing this call's budgets, cancellation, and earliest safe expiry. */
  #call(state: CallState): GatewayCall {
    const configuration = new Configuration({
      basePath: API_ORIGIN,
      accessToken: async () => {
        this.#checkAuth();
        const provider = this.#options.configuration.accessToken;

        if (!provider) {
          throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
        }

        const token = await provider("bearerAuth", []);

        state.signal.throwIfAborted();
        if (!token) {
          throw new ApplicationFailure("AUTHORIZATION_REQUIRED");
        }

        return token;
      },
      fetchApi: async (input, init) =>
        this.#fetch(state, String(input), init ?? {}, false),
    });

    const handleIds = new Map<GatewaySearch, number>();

    /** Share only pending work for a key within this call; settled results are not retained. */
    const once = <T>(key: string, work: () => Promise<T>): Promise<T> => {
      if (state.signal.aborted) {
        return Promise.reject(unavailable());
      }

      this.#checkAuth();
      const existing = state.pending.get(key);

      if (existing) {
        return existing as Promise<T>;
      }

      const promise = work();

      state.pending.set(key, promise);
      void promise
        .finally(() => state.pending.delete(key))
        .catch(() => undefined);

      return promise;
    };

    /** Parse JSON, converting parse errors or cancellation after parsing to invalid_data. */
    const json = async (response: Response): Promise<unknown> => {
      try {
        const value: unknown = await response.json();

        state.signal.throwIfAborted();

        return value;
      } catch {
        return invalidData();
      }
    };

    /** Read raw generated responses and unwrap only ApplicationFailure causes from FetchError. */
    const raw = async (request: () => Promise<ApiResponse<unknown>>) => {
      try {
        return await json((await request()).raw);
      } catch (error) {
        // The generated ES5 FetchError wraps our seam error. Recover only our
        // branded, already-sanitized failure, never arbitrary upstream causes.
        const cause =
          error instanceof Error && error.name === "FetchError"
            ? Object.getOwnPropertyDescriptor(error, "cause")?.value
            : undefined;

        throw cause instanceof ApplicationFailure ? cause : error;
      }
    };

    /**
     * Resolve and validate a linked payload, reserving a 30-second expiry margin.
     * Reacquire the envelope once on expiry or cache 403/404 within the same call budget;
     * propagate other failures and record the successful link's safe expiry on the call.
     */
    const linked = <T>(
      key: string,
      request: () => Promise<ApiResponse<unknown>>,
      schema: z.ZodType<T>,
    ) =>
      once(key, async () => {
        for (let attempt = 0; attempt < 2; attempt++) {
          const envelope = parseEnvelope(await raw(request));

          if (envelope.expiry <= this.#now() + 30_000) {
            if (!attempt) {
              continue;
            }

            throw expired();
          }

          try {
            const value = await json(
              await this.#fetch(state, envelope.url, {}, true),
            );

            if (envelope.expiry <= this.#now() + 30_000) {
              throw expired();
            }

            state.expiry = Math.min(state.expiry, envelope.expiry - 30_000);

            return parse(schema, value);
          } catch (error) {
            if (
              !attempt &&
              error instanceof ApplicationFailure &&
              errorEnvelope(error, createRequestContext()).error.code ===
                "CURSOR_EXPIRED"
            ) {
              continue;
            }

            throw error;
          }
        }

        throw expired();
      });

    /** Parse operation parameters or throw INVALID_INPUT before making a request. */
    const validated = <T>(schema: z.ZodType<T>, params: unknown): T => {
      const result = schema.safeParse(params);

      if (!result.success) {
        throw new ApplicationFailure("INVALID_INPUT");
      }

      return result.data;
    };

    return {
      get expiresAt() {
        return state.expiry;
      },
      document: () =>
        once("document", async () =>
          parse(
            directSchemas.document,
            await raw(() => new DocApi(configuration).getDocsRaw()),
          ),
        ),
      constants: () =>
        once("constants", async () =>
          parse(
            directSchemas.constants,
            await raw(() =>
              new ConstantsApi(configuration).getConstantsCategoriesRaw(),
            ),
          ),
        ),
      member: () =>
        linked(
          "member",
          () => new MemberApi(configuration).getMemberInfoRaw(),
          payloadSchemas.member,
        ),
      cars: () =>
        linked(
          "cars",
          () => new CarApi(configuration).getCarRaw(),
          payloadSchemas.cars,
        ),
      tracks: () =>
        linked(
          "tracks",
          () => new TrackApi(configuration).getTrackRaw(),
          payloadSchemas.tracks,
        ),
      drivers: (params) => {
        const p = validated(LookupDriversParametersSchema.strict(), params);

        return linked(
          "drivers" + JSON.stringify(p),
          () => new LookupApi(configuration).getLookupDriversRaw(p),
          payloadSchemas.drivers,
        );
      },
      recent: (params = {}) => {
        const p = validated(
          StatsMemberRecentRacesParametersSchema.strict(),
          params,
        );

        return linked(
          "recent" + JSON.stringify(p),
          () => new StatsApi(configuration).getStatsMemberRecentRacesRaw(p),
          payloadSchemas.recent,
        );
      },
      seasons: (params = {}) => {
        const p = validated(SeriesSeasonListParametersSchema.strict(), params);

        return linked(
          "seasons" + JSON.stringify(p),
          () => new SeriesApi(configuration).getSeriesSeasonListRaw(p),
          payloadSchemas.seasons,
        );
      },
      schedule: (params) => {
        const p = validated(
          SeriesSeasonScheduleParametersSchema.strict(),
          params,
        );

        return linked(
          "schedule" + JSON.stringify(p),
          () => new SeriesApi(configuration).getSeriesSeasonScheduleRaw(p),
          payloadSchemas.schedule,
        );
      },
      result: (params) => {
        const p = validated(ResultsGetParametersSchema.strict(), params);

        return linked(
          "result" + JSON.stringify(p),
          () => new ResultsApi(configuration).getResultsRaw(p),
          payloadSchemas.result,
        );
      },
      search: (params = {}) =>
        once("search" + JSON.stringify(params), async () => {
          const wire = Object.fromEntries(
            Object.entries(params).map(([key, value]) => [
              key,
              value instanceof Date ? value.toISOString() : value,
            ]),
          );

          const p = validated(
            ResultsSearchSeriesParametersSchema.strict(),
            wire,
          );

          const request: GetResultsSearchSeriesRequest = {
            ...p,
            start_range_begin: p.start_range_begin
              ? new Date(p.start_range_begin)
              : undefined,
            start_range_end: p.start_range_end
              ? new Date(p.start_range_end)
              : undefined,
            finish_range_begin: p.finish_range_begin
              ? new Date(p.finish_range_begin)
              : undefined,
            finish_range_end: p.finish_range_end
              ? new Date(p.finish_range_end)
              : undefined,
          };

          // #348's canonical schema landed, but this parent's generated converter still
          // models a link. Consume raw, bounded JSON; never cast a manifest to a link.
          const info = parseManifest(
            await raw(() =>
              new ResultsApi(configuration).getResultsSearchSeriesRaw(request),
            ),
          );

          this.#prune();
          if (this.#searches.size >= GATEWAY_LIMITS.cursors) {
            throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
          }

          const expiry = this.#now() + GATEWAY_LIMITS.cursorTtlMs;

          const handle = Object.freeze({
            totalRows: info.rows,
            chunks: info.num_chunks,
            expiresAt: expiry,
          });

          const bytes = Buffer.byteLength(JSON.stringify(info));

          if (this.#retained + bytes > GATEWAY_LIMITS.retainedBytes) {
            throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
          }

          this.#retained += bytes;
          this.#searches.set(handle, { info, expiry, bytes, cache: new Map() });

          return handle;
        }),
      chunk: (handle, index) =>
        once(
          "chunk" +
            (handleIds.get(handle) ??
              (handleIds.set(handle, handleIds.size), handleIds.get(handle))) +
            ":" +
            index,
          async () => {
            this.#checkAuth();
            this.#prune();
            const search = this.#searches.get(handle);

            if (!search) {
              throw expired();
            }

            if (
              !Number.isSafeInteger(index) ||
              index < 0 ||
              index >= search.info.num_chunks
            ) {
              throw new ApplicationFailure("INVALID_INPUT");
            }

            state.expiry = Math.min(state.expiry, search.expiry);
            const cached = search.cache.get(index);

            if (cached) {
              state.bytes += cached.bytes;
              if (state.bytes > GATEWAY_LIMITS.callBytes) {
                throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
              }

              return structuredClone(cached.rows);
            }

            const url = chunkUrl(
              search.info.base_download_url,
              search.info.chunk_file_names[index],
            );

            let response: Response;

            try {
              response = await this.#fetch(state, url.href, {}, true);
            } catch (error) {
              if (
                errorEnvelope(error, createRequestContext()).error.code ===
                "CURSOR_EXPIRED"
              ) {
                this.#drop(handle);
              }

              throw error;
            }

            const text = await response.text();

            let value: unknown;

            try {
              value = JSON.parse(text);
            } catch {
              return invalidData();
            }

            if (state.signal.aborted) {
              throw unavailable();
            }

            const rows = parse(arrayPayload, value);

            const expected = Math.min(
              search.info.chunk_size,
              search.info.rows - index * search.info.chunk_size,
            );

            if (rows.length !== expected) {
              invalidData();
            }

            if (this.#now() >= search.expiry || !this.#searches.has(handle)) {
              throw expired();
            }

            const bytes = Buffer.byteLength(text);

            if (
              !search.cache.has(index) &&
              this.#retained + bytes > GATEWAY_LIMITS.retainedBytes
            ) {
              throw new ApplicationFailure("RESPONSE_LIMIT_EXCEEDED");
            }

            // Another call may have completed the same deduplicated chunk meanwhile.
            if (!search.cache.has(index)) {
              search.cache.set(index, { rows, bytes });
              this.#retained += bytes;
            }

            return structuredClone(rows);
          },
        ),
    };
  }
}
export interface GatewayCall {
  /** Earliest safe cursor expiry of this call, including the 30-second link margin. */
  readonly expiresAt: number;

  /** Return the validated API documentation document without resolving links. */
  document(): Promise<z.infer<typeof directSchemas.document>>;

  /** Return the validated constants categories array directly from the API. */
  constants(): Promise<z.infer<typeof directSchemas.constants>>;

  /** Resolve and validate the authorized member profile from its cache link. */
  member(): Promise<z.infer<typeof payloadSchemas.member>>;

  /** Validate lookup parameters and resolve the matching driver records. */
  drivers(
    params: GetLookupDriversRequest,
  ): Promise<z.infer<typeof payloadSchemas.drivers>>;

  /** Resolve and validate the car collection from its cache link. */
  cars(): Promise<z.infer<typeof payloadSchemas.cars>>;

  /** Resolve and validate the track collection from its cache link. */
  tracks(): Promise<z.infer<typeof payloadSchemas.tracks>>;

  /** Resolve recent races using validated parameters; omitted parameters use API defaults. */
  recent(
    params?: GetStatsMemberRecentRacesRequest,
  ): Promise<z.infer<typeof payloadSchemas.recent>>;

  /** Resolve seasons using validated parameters; omitted parameters use API defaults. */
  seasons(
    params?: GetSeriesSeasonListRequest,
  ): Promise<z.infer<typeof payloadSchemas.seasons>>;

  /** Resolve and validate the requested season schedule, requiring a successful response. */
  schedule(
    params: GetSeriesSeasonScheduleRequest,
  ): Promise<z.infer<typeof payloadSchemas.schedule>>;

  /** Resolve and validate the requested subsession result. */
  result(
    params: GetResultsRequest,
  ): Promise<z.infer<typeof payloadSchemas.result>>;

  /**
   * Validate search parameters and retain a manifest without downloading result chunks.
   * Return a gateway-local handle valid for five minutes, with expiresAt in Unix
   * milliseconds. Reuse the exact handle object for chunk reads across calls.
   * Capacity exhaustion throws RESPONSE_LIMIT_EXCEEDED; request and validation
   * failures propagate. Searches are never automatically recreated after expiry.
   */
  search(params?: GetResultsSearchSeriesRequest): Promise<GatewaySearch>;

  /**
   * Return one chunk in its original row order, copying rows from the private cache.
   * The index is zero-based; an out-of-range or noninteger index throws INVALID_INPUT.
   * Missing or expired handles throw CURSOR_EXPIRED; cache 403/404 also retires the handle.
   * Invalid rows/counts throw DATA_RESOLUTION_FAILED, and byte/retention limits throw
   * RESPONSE_LIMIT_EXCEEDED. Other fetch failures propagate; cached reads still consume
   * the call's byte budget.
   */
  chunk(
    search: GatewaySearch,
    index: number,
  ): Promise<readonly Record<string, unknown>[]>;
}
