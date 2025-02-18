import { AxiosInstance } from "axios";

export class TeamAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  get({
    teamId,
    includeLicenses,
  }: {
    teamId: number;
    includeLicenses?: boolean;
  }) {
    return this._client.get(`/data/team/get`, {
      params: { team_id: teamId, include_licenses: includeLicenses },
    });
  }
}

export default TeamAPI;
