import IRacingAPI from "@iracing-data/api";
import { handleOutput, hasValidSession } from "../util";
import { Command } from "commander";

export type MemberProfileOptions = {
  custId?: number;
  output?: string;
};

export const addMemberProfileCommand = (program: Command, api: IRacingAPI) =>
  program
    .command("member-profile")
    .description("Fetch member profile")
    .option("-c, --cust-id <custId>", "Customer ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(memberProfile(api));

export const memberProfile =
  (api: IRacingAPI) =>
  async ({ custId, output }: MemberProfileOptions) => {
    if (!hasValidSession(api)) return;

    console.log(`Fetching member profile${custId ? ` for ${custId}` : ""}...`);

    const memberProfile = await api.getMemberProfile(custId);

    handleOutput(memberProfile, output);
  };

export default memberProfile;
