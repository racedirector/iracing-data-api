import IRacingAPI from "@iracing-data/api";
import { handleOutput, hasValidSession } from "../util";

export type MemberProfileOptions = {
  custId?: number;
  output?: string;
};

export const memberProfile =
  (api: IRacingAPI) =>
  async ({ custId, output }: MemberProfileOptions) => {
    if (!hasValidSession(api)) return;

    console.log(`Fetching member profile${custId ? ` for ${custId}` : ""}...`);

    const memberProfile = await api.getMemberProfile(custId);

    handleOutput(memberProfile, output);
  };

export default memberProfile;
