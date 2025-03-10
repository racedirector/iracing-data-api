#!/usr/bin/env node
import { Command } from "@commander-js/extra-typings";
import packageMeta from "../package.json";

const program = new Command("lap-timing")
  .description("Lap timing telemetry server")
  .version(packageMeta.version)
  .option("-o, --output <file>", "Output file");

program.command("start").description("Start the telemetry server");

program.parse();
