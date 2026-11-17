export { createIracingMcpServer } from "./factory.js";
export {
  AssetDefinitions,
  createAssetResource,
} from "./resources/assets/definitions.js";
export type { AssetDefinition } from "./resources/assets/definitions.js";
export {
  AssetMediaIndexSchema,
  createAssetMediaIndex,
} from "./resources/assets/media-index.js";
export {
  createResourceSchema,
  registerResourceSchemas,
} from "./resources/schemas.js";
export type { ResourceSchema } from "./resources/schemas.js";
export {
  ReferenceDocuments,
  createReferenceDocumentResource,
  registerReferenceDocuments,
} from "./resources/documents.js";
export type {
  ReferenceDocument,
  ReferenceDocumentDefinition,
} from "./resources/documents.js";
export { registerAssetResources } from "./resources/assets/index.js";
export {
  assetId,
  imageUrl,
  trackMapUrl,
  ImageFieldSchema,
} from "./resources/assets/service.js";
export type {
  AssetCatalog,
  AssetKind,
  AssetMedia,
  ReadAssetMedia,
} from "./resources/assets/service.js";
export type { IracingMcpServerOptions } from "./factory.js";
export { registerReferenceResources } from "./resources/index.js";
export type { CatalogResolver, ReferenceCatalog } from "./resources/service.js";
export type { CatalogDefinition } from "./resources/definitions.js";
export {
  CarsCatalog,
  TracksCatalog,
  CarClassesCatalog,
  SeriesCatalog,
  createReferenceResource,
} from "./resources/definitions.js";
export { registerIracingTools } from "./register.js";
export {
  SearchInput,
  SearchOutput,
  SearchRow,
} from "./tools/search-race-results/schema.js";
export type {
  RaceSearchInput,
  RaceSearchOutput,
} from "./tools/search-race-results/schema.js";
export type { RaceSearchQueries } from "./tools/search-race-results/service.js";
export { DriverProjection, SelfInput } from "./tools/get-my-driver/schema.js";
export type { Driver } from "./tools/get-my-driver/schema.js";
export type { DriverQueries } from "./tools/get-my-driver/service.js";
export {
  RecentInput,
  RecentProjection,
  RecentRaceWindowSchema,
  RecentOutputSchema,
} from "./tools/get-recent-races/schema.js";
export type { RecentRaceWindow } from "./tools/get-recent-races/schema.js";
export type { RecentRaceQueries } from "./tools/get-recent-races/service.js";
export type {
  IracingToolRegistry,
  IracingToolContext,
  IracingToolServices,
} from "./services.js";
export {
  ApplicationFailure,
  ApplicationErrorCodeSchema,
  ErrorEnvelopeSchema,
  createRequestContext,
  toolError,
  errorEnvelope,
  ProtocolFailure,
  requestId,
  errorPolicy,
} from "./diagnostics/errors.js";
export type {
  ApplicationErrorCode,
  RequestContext,
  FailureDomain,
} from "./diagnostics/errors.js";
