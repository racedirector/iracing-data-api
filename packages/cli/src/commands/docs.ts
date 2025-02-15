import { IRacingAPI } from "@iracing-data/api";
import { handleOutput, hasValidSession } from "../util";

export const docs =
  (api: IRacingAPI) => async (options: { output: string }) => {
    if (!hasValidSession(api)) return;

    console.log("Downloading API documentation...");
    const docs = await api.getDoc();

    handleOutput(docs, options.output);
  };

export default docs;
