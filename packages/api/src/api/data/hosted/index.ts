import { IRacingAPIResponse, NetworkClientProvider } from "../../types";

export class HostedAPI extends NetworkClientProvider {
  /**
   * Sessions that can be joined as a driver or spectator, and also includes
   * non-league pending sessions for the user.
   */
  combinedSessions({ packageId }: { packageId?: number } = {}) {
    return this.client.get<IRacingAPIResponse>(
      `/data/hosted/combined_sessions`,
      {
        params: { package_id: packageId },
      }
    );
  }

  /**
   * Sessions that can be joined as a driver. Without spectator and non-league
   * pending sessions for the user.
   */
  sessions() {
    return this.client.get<IRacingAPIResponse>("/data/hosted/sessions");
  }
}

export default HostedAPI;
