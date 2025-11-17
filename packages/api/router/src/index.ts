import { createRouter as createRouterFn, RouterConfig } from "better-call";
import { toNodeHandler } from "better-call/node";
import * as routes from "./routes";

export interface CreateRouterOptions extends RouterConfig {}

export function createRouter(options: CreateRouterOptions = {}) {
  return createRouterFn(
    {
      ...routes,
    },
    options
  );
}

export * from "@iracing-data/api-client-fetch";
export * from "./middleware";
export { routes, toNodeHandler };
export default createRouter;
