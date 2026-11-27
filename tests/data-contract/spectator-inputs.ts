import {
  MemberGetParametersSchema,
  LeagueDirectoryParametersSchema,
  ResultsSearchHostedParametersSchema,
  ResultsSearchSeriesParametersSchema,
} from "../../packages/api/schema/dist";
import { z } from "../../packages/api/schema/node_modules/zod";
import type {
  SeasonApi as AxiosSeasonApi,
  ResultsApi as AxiosResultsApi,
  MemberApi as AxiosMemberApi,
  LeagueApi as AxiosLeagueApi,
} from "../../packages/api/client/axios/dist";
import type {
  SeasonApi as FetchSeasonApi,
  ResultsApi as FetchResultsApi,
  MemberApi as FetchMemberApi,
  LeagueApi as FetchLeagueApi,
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

// Member input/output types are precise and directly usable by both SDKs.
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
const memberInputIsPrecise: Equal<
  z.input<typeof MemberGetParametersSchema>,
  { cust_ids: string[]; include_licenses?: boolean }
> = true;
const memberOutputMatchesInput: Equal<
  z.input<typeof MemberGetParametersSchema>,
  z.output<typeof MemberGetParametersSchema>
> = true;
const memberParameters = MemberGetParametersSchema.parse({
  cust_ids: ["2", "3", "2"],
  include_licenses: false,
});
const fetchMember: Parameters<FetchMemberApi["getMember"]>[0] =
  memberParameters;
const axiosMember: Parameters<AxiosMemberApi["getMember"]>[0] =
  memberParameters;
void memberInputIsPrecise;
void memberOutputMatchesInput;
void fetchMember;
void axiosMember;

const directory = LeagueDirectoryParametersSchema.parse({ tag: ["a", "b"] });
const hosted = ResultsSearchHostedParametersSchema.parse({
  category_ids: [1, 5],
});
const series = ResultsSearchSeriesParametersSchema.parse({
  event_types: [2, 5],
  category_ids: [1, 5],
});
const fetchDirectory: Parameters<FetchLeagueApi["getLeagueDirectory"]>[0] =
  directory;
const axiosDirectory: Parameters<AxiosLeagueApi["getLeagueDirectory"]>[0] =
  directory;
const fetchHosted: Pick<
  NonNullable<Parameters<FetchResultsApi["getResultsSearchHosted"]>[0]>,
  "category_ids"
> = { category_ids: hosted.category_ids };
const axiosHosted: Parameters<AxiosResultsApi["getResultsSearchHosted"]>[0] =
  hosted;
const fetchSeries: Pick<
  NonNullable<Parameters<FetchResultsApi["getResultsSearchSeries"]>[0]>,
  "event_types" | "category_ids"
> = { event_types: series.event_types, category_ids: series.category_ids };
const axiosSeries: Parameters<AxiosResultsApi["getResultsSearchSeries"]>[0] =
  series;
void fetchDirectory;
void axiosDirectory;
void fetchHosted;
void axiosHosted;
void fetchSeries;
void axiosSeries;
