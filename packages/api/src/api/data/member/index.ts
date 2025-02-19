import {
  CategoryIdValue,
  ChartTypeValue,
  NetworkClientProvider,
} from "../../../types";

export class MemberAPI extends NetworkClientProvider {
  awards({ customerId }: { customerId?: number } = {}) {
    return this.client.get("/data/member/awards", {
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
    return this.client.get("/data/member/award_instances", {
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
    return this.client.get("/data/member/chart_data", {
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
    return this.client.get("/data/member/get", {
      params: { cust_ids: customerIds, include_licenses: includeLicenses },
    });
  }

  info() {
    return this.client.get("/data/member/info");
  }

  participationCredits() {
    return this.client.get("/data/member/participation_credits");
  }

  profile({ customerId }: { customerId?: number } = {}) {
    return this.client.get("/data/member/profile", {
      params: { cust_id: customerId },
    });
  }
}

export default MemberAPI;
