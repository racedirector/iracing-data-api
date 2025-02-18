import { AxiosInstance } from "axios";
import { CategoryIdValue, ChartTypeValue } from "../../types";

export class MemberAPI {
  _client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this._client = client;
  }

  awards({ customerId }: { customerId?: number } = {}) {
    return this._client.get("/data/member/awards", {
      params: { cust_id: customerId },
    });
  }

  awardInstances({
    customerId,
    awardId,
  }: {
    customerId?: number;
    awardId: number;
  }) {
    return this._client.get("/data/member/award_instances", {
      params: { cust_id: customerId, award_id: awardId },
    });
  }

  chartData({
    customerId,
    categoryId,
    chartType,
  }: {
    customerId?: number;
    categoryId: CategoryIdValue;
    chartType: ChartTypeValue;
  }) {
    return this._client.get("/data/member/chart_data", {
      params: {
        cust_id: customerId,
        category_id: categoryId,
        chart_type: chartType,
      },
    });
  }

  get({
    customerIds,
    includeLicenses,
  }: {
    customerIds: number[];
    includeLicenses?: boolean;
  }) {
    return this._client.get("/data/member/get", {
      params: { cust_ids: customerIds, include_licenses: includeLicenses },
    });
  }

  info() {
    return this._client.get("/data/member/info");
  }

  participationCredits() {
    return this._client.get("/data/member/participation_credits");
  }

  profile({ customerId }: { customerId?: number } = {}) {
    return this._client.get("/data/member/profile", {
      params: { cust_id: customerId },
    });
  }
}

export default MemberAPI;
