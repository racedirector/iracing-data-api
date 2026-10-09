/**
 * Public Data API schema exports. Canonical names and historical aliases remain
 * available at package root and declaration modules. Aliases share value identity
 * and inferred types; renaming imports requires no data conversion or runtime
 * warning. Removing an alias is a separate breaking-release decision, not cleanup.
 * tests/schema-compatibility owns frozen provenance and compatibility enforcement.
 */

export * from "./schema";
