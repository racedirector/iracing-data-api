import { RetentionBudget } from "./retention.js";
import { CollectionCursors } from "./tools/collections.js";
const owners = new WeakMap<
  object,
  { collections: CollectionCursors; budget: RetentionBudget }
>();

/** Retain only MCP state under an opaque host-owned scope, never credential identity. */
export function continuation(scope: object) {
  let owner = owners.get(scope);

  if (!owner) {
    const budget = new RetentionBudget();

    owner = { budget, collections: new CollectionCursors(Date.now, budget) };
    owners.set(scope, owner);
  }

  return owner;
}
