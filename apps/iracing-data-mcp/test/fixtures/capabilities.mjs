import { ApplicationFailure } from "@iracing-data/mcp";

export function capabilities(mode, custId = 7) {
  return {
    driverQueries: {
      async getCurrent({ signal }) {
        signal.throwIfAborted();
        if (mode === "unexpected") {
          throw new Error("TOKEN_SECRET https://cache.test/?signature=SECRET");
        }
        if (mode === "authorization") {
          throw new ApplicationFailure("AUTHORIZATION_REQUIRED", {
            reason: "missing_session",
          });
        }
        return {
          cust_id: mode === "invalid-output" ? "SECRET" : custId,
          display_name: `Driver ${custId}`,
          token: "TOKEN_SECRET",
        };
      },
    },
    recentRaceQueries: {
      async getRecent({ signal }) {
        signal.throwIfAborted();
        return {
          cust_id: custId,
          races: [{ subsession_id: 100, points: 3 }],
        };
      },
    },
  };
}
