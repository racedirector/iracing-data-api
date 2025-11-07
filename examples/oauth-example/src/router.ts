import { createRouter } from "better-call";
import * as routes from "./routes";

export const router = createRouter(
  { ...routes },
  {
    openapi: {
      scalar: {
        title: "iRacing OAuth Client Example API",
        version: "0.0.1",
        description: "An iRacing OAuth Client implementation example.",
      },
    },
  }
);

export default router;
