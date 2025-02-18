import { AxiosInstance } from "axios";
import { IRacingAPIResponse } from "../../types";

export class LookupAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  clubHistory({
    seasonYear,
    seasonQuarter,
  }: {
    seasonYear: number;
    seasonQuarter: number;
  }) {
    return this._client.get<IRacingAPIResponse>("/data/lookup/club_history", {
      params: { season_year: seasonYear, season_quarter: seasonQuarter },
    });
  }

  countries() {
    return this._client.get<IRacingAPIResponse>("/data/lookup/countries");
  }

  drivers({ searchTerm, leagueId }: { searchTerm: string; leagueId?: number }) {
    return this._client.get<IRacingAPIResponse>("/data/lookup/drivers", {
      params: { search_term: searchTerm, league_id: leagueId },
    });
  }

  get(params: Record<string, string>) {
    return this._client.get<IRacingAPIResponse>("/data/lookup/get", { params });
  }

  licenses() {
    return this._client.get<IRacingAPIResponse>("/data/lookup/licenses");
  }
}

export default LookupAPI;
