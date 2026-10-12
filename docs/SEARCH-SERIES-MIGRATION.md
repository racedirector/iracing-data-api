# Search-series manifest correction

Data API clients 0.2.0 correct `getResultsSearchSeries` (Rust
`get_results_search_series`) to return `ResultsSearchSeriesResponse`, the direct
`search_series_results` manifest. Earlier clients incorrectly exposed the generic
`link`/`expires` response and Fetch decoding discarded the manifest fields.

PR #368 already provided the maintained Zod schema. This correction maps only
`/data/results/search_series` to that schema and regenerates OpenAPI JSON/YAML and
Fetch, Axios and Rust. Other results endpoints retain their existing contracts.

Fetch consumers read `result.data.chunkInfo`, including `chunkSize`, `numChunks`,
`rows`, `baseDownloadUrl` and `chunkFileNames`. Open `result.data.params` data is
preserved. Axios retains the wire field names under `response.data.data.chunk_info`;
Rust uses the typed manifest under `response.data.chunk_info`.

Use the generated endpoint method directly instead of casting an envelope or
manually decoding its raw response. Chunk loading and pagination remain consumer
concerns. This change does not redesign MCP hosting, gateway or continuation state.

The return-type correction is a source compatibility change. The three pre-1.0
clients advance independently from 0.1.0 to 0.2.0; the schema package is unchanged.
These are reviewed release versions, not authorization to publish or tag a release.
