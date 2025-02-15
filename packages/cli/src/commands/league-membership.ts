import { Command } from "commander";
import IRacingAPI from "@iracing-data/api";
import { handleOutput } from "../util";

export const addLeagueMembershipCommand = (program: Command, api: IRacingAPI) =>
  program
    .command("league-membership")
    .description("Fetch league membership")
    .option("-c, --cust-id <custId>", "Customer ID", parseInt)
    .option("-l, --include-league", "Include league")
    .option("-o, --output <path>", "Output path")
    .action(leagueMembership(api));

export const leagueMembership = (api: IRacingAPI) => async (custId: number) => {
  const leagueMembership = await api.getLeagueMembership(custId);
  handleOutput(leagueMembership);
};

export default leagueMembership;
