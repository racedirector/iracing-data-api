import { NetworkClientProvider, IRacingAPIResponse } from "../../types";

export class LookupAPI extends NetworkClientProvider {
  countries() {
    return this.client.get<IRacingAPIResponse>("/data/lookup/countries");
  }

  drivers({ searchTerm, leagueId }: { searchTerm: string; leagueId?: number }) {
    return this.client.get<IRacingAPIResponse>("/data/lookup/drivers", {
      params: { search_term: searchTerm, league_id: leagueId },
    });
  }

  flairs() {
    return this.client.get<IRacingAPIResponse>("/data/lookup/flairs");
  }

  get(params: Record<string, string>) {
    return this.client.get<IRacingAPIResponse>("/data/lookup/get", { params });
  }

  licenses() {
    return this.client.get<IRacingAPIResponse>("/data/lookup/licenses");
  }
}

export default LookupAPI;
