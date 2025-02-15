import IRacingAPI from "@iracing-data/api";
import { handleOutput, hasValidSession } from "../util";

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
