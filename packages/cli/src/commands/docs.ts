import { IRacingAPI } from "@iracing-data/api";
import { handleOutput, hasValidSession } from "../util";
import { Command } from "commander";

export const addDocsCommand = (program: Command, api: IRacingAPI) =>
  program
    .command("docs")
    .description("Downloads the latest API documentation from `/data/doc`")
    .option("-o, --output <path>", "Output path")
    .action(docs(api));

export const docs =
  (api: IRacingAPI) => async (options: { output: string }) => {
    if (!hasValidSession(api)) return;

    console.log("Downloading API documentation...");
    const docs = await api.getDoc();

    handleOutput(docs, options.output);
  };

export default docs;
