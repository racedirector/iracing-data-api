import type { SeasonApi as AxiosSeasonApi } from "../../packages/api/client/axios/dist";
import type { SeasonApi as FetchSeasonApi } from "../../packages/api/client/fetch/dist";
import type { SeasonSpectatorSubsessionidsDetailParameters } from "../../packages/api/schema/dist";

const parameters: SeasonSpectatorSubsessionidsDetailParameters = {
  event_types: [2, 5],
  season_ids: [513, 937],
};
const fetchParameters: Parameters<
  FetchSeasonApi["getSeasonSpectatorSubsessionIdsDetail"]
>[0] = parameters;
const axiosParameters: Parameters<
  AxiosSeasonApi["getSeasonSpectatorSubsessionIdsDetail"]
>[0] = parameters;
void fetchParameters;
void axiosParameters;
const csv: SeasonSpectatorSubsessionidsDetailParameters = {
  // @ts-expect-error CSV is a transport representation, not the consumer input type.
  event_types: "2,5",
};
const named: SeasonSpectatorSubsessionidsDetailParameters = {
  // @ts-expect-error Event types retain their established numeric IDs.
  event_types: ["Practice"],
};
void csv;
void named;
