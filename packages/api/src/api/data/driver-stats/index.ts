import { NetworkClientProvider, CategoryValue } from "../../../types";

export class DriverStatsAPI extends NetworkClientProvider {
  category({ category }: { category: CategoryValue }) {
    return this.client.get(`/data/driver_stats_by_category/${category}`);
  }
}

export default DriverStatsAPI;
