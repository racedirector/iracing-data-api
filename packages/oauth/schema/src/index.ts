/**
 * Public OAuth wire-schema and scope exports. Historical aliases remain available
 * alongside canonical names at package root and declaration modules, including
 * client re-exports. They share value identity/types and do not change wire keys,
 * parsing or runtime warnings. Alias removal requires a separate breaking decision.
 * tests/schema-compatibility owns frozen provenance and compatibility enforcement.
 */

export * from "./schema";
export * from "./scopes";
