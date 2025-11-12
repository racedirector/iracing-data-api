import { createEndpoint } from "../utils";

export const getDoc = createEndpoint(
  "/data/doc",
  {
    method: "GET",
  },
  async ({ context: { iracing } }) => {
    const response = await iracing.doc.getDocs();
    return response.data;
  }
);
