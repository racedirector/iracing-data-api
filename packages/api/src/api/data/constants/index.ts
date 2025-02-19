import { NetworkClientProvider, IRacingAPIResponse } from "../../../types";

export class ConstantsAPI extends NetworkClientProvider {
  categories() {
    return this.client.get<IRacingAPIResponse>("/data/constants/categories");
  }

  divisions() {
    return this.client.get<IRacingAPIResponse>("/data/constants/divisions");
  }

  eventTypes() {
    return this.client.get<IRacingAPIResponse>("/data/constants/event_types");
  }
}

export default ConstantsAPI;
