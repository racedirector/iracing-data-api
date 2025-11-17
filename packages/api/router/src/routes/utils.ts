import { createEndpoint as createEndpointFn } from "better-call";
import { iracingClientMiddleware } from "../middleware";

export const createEndpoint = createEndpointFn.create({
  use: [iracingClientMiddleware],
});
