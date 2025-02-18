import { AxiosInstance } from "axios";
import { CategoryValue } from "../../types";

export class DriverStatsAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  category({ category }: { category: CategoryValue }) {
    return this._client.get(`/data/driver_stats_by_category/${category}`);
  }
}

export default DriverStatsAPI;
