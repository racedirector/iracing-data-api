import { NetworkClientProvider } from "../../types";

export class TeamAPI extends NetworkClientProvider {
  get({
    teamId,
    includeLicenses,
  }: {
    teamId: number;
    includeLicenses?: boolean;
  }) {
    return this.client.get(`/data/team/get`, {
      params: { team_id: teamId, include_licenses: includeLicenses },
    });
  }
}

export default TeamAPI;
