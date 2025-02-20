import { NetworkClientProvider } from "../../types";

export class TimeAttackAPI extends NetworkClientProvider {
  memberSeasonResults({ seasonId }: { seasonId: number }) {
    return this.client.get(`/data/time_attack/member_season_results`, {
      params: { ta_comp_season_id: seasonId },
    });
  }
}

export default TimeAttackAPI;
