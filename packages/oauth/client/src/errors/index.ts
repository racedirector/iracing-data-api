/**
 * Public error exports and claims-validation failures.
 *
 * These errors preserve useful typed information for callers, including expected
 * and received claim values. They are not redacted application messages. Resource
 * adapters must project fixed/allowlisted diagnostics and distinguish structural
 * claims validation, signature verification, provider rejection and storage failure.
 */
export * from "./client-metadata";
export * from "./oauth";
