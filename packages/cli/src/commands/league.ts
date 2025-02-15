import IRacingAPI from "@iracing-data/api";
import { handleOutput, hasValidSession } from "../util";
import { Command } from "commander";

export const addLeagueCommand = (program: Command, api: IRacingAPI) =>
  program
    .command("league <leagueId>")
    .description("Fetch league")
    .option("-l, --include-licenses", "Include licenses")
    .option("-o, --output <path>", "Output path")
    .action(league(api));

export type LeagueOptions = {
  custId: number;
  includeLicenses?: boolean;
  output?: string;
};

export const league =
  (api: IRacingAPI) =>
  async ({ custId, includeLicenses, output }: LeagueOptions) => {
    if (!hasValidSession(api)) return;

    const league = await api.getLeague(custId, includeLicenses);

    handleOutput(league, output);
  };

export default league;
