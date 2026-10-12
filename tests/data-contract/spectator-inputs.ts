import type {
  SeasonApi as AxiosSeasonApi,
  ResultsApi as AxiosResultsApi,
} from "../../packages/api/client/axios/dist";
import type {
  SeasonApi as FetchSeasonApi,
  ResultsApi as FetchResultsApi,
} from "../../packages/api/client/fetch/dist";
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

// The corrected endpoint exposes the direct manifest in both generated APIs.
function manifestTypes(
  fetch: Awaited<ReturnType<FetchResultsApi["getResultsSearchSeries"]>>,
  axios: Awaited<ReturnType<AxiosResultsApi["getResultsSearchSeries"]>>,
) {
  const rows: number = fetch.data.chunkInfo.rows;
  const files: string[] = axios.data.data.chunk_info.chunk_file_names;
  // @ts-expect-error The direct manifest is not a link-envelope response.
  void fetch.link;
  // @ts-expect-error The direct manifest is not a link-envelope response.
  void axios.data.expires;
  return { rows, files };
}
void manifestTypes;
