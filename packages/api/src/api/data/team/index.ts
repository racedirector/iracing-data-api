import { IRacingAPIResponse, NetworkClientProvider } from "../../types";

export class TeamAPI extends NetworkClientProvider {
  get({
    teamId,
    includeLicenses,
  }: {
    teamId: number;
    includeLicenses?: boolean;
  }) {
    return this.client.get<IRacingAPIResponse>(`/data/team/get`, {
      params: { team_id: teamId, include_licenses: includeLicenses },
    });
  }

  membership() {
    return this.client.get<IRacingAPIResponse>("/data/team/membership");
  }
}

export default TeamAPI;
