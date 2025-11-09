import { createRouter as createRouterFn, RouterConfig } from "better-call";
import { toNodeHandler as toNodeHandlerFn } from "better-call/node";
import * as routes from "./routes";

export interface CreateRouterOptions extends RouterConfig {}

export function createRouter({ ...options }: CreateRouterOptions = {}) {
  return createRouterFn(
    {
      ...routes,
    },
    options
  );
}

export function createNodeHandler(options: CreateRouterOptions = {}) {
  return toNodeHandler(createRouter(options));
}

export function toNodeHandler(router: ReturnType<typeof createRouter>) {
  return toNodeHandlerFn(router.handler);
}

export * from "./middleware";
export { routes };
export default createRouter;
