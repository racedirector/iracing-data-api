import { AxiosInstance } from "axios";

export class TimeAttackAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  memberSeasonResults({ seasonId }: { seasonId: number }) {
    return this._client.get(`/data/time_attack/member_season_results`, {
      params: { ta_comp_season_id: seasonId },
    });
  }
}

export default TimeAttackAPI;
