# Schema symbol migration

Remove only the leading `IRacing` from schema imports. Keep `OAuth` in OAuth names. Canonical callback spelling is `OAuthCallbackParametersSchema`; the historical `IRacingOAuthCllbackParametersSchema` remains supported.

```typescript
// Existing imports remain valid, with replacement-specific editor deprecation hints.
import { IRacingCustomerIdSchema } from "@iracing-data/api-schema";
// Prefer this spelling for new code.
import { CustomerIdSchema } from "@iracing-data/api-schema";
```

Both names refer to the same value. Type aliases preserve inferred types, brands, literals, and codec input/output types. Existing package-root and declaration-module imports remain available. OAuth-client re-exports expose both surfaces. There are no runtime warnings or changes to parsing, errors, wire keys, metadata IDs, runtime client APIs, or generated SDK names. Validation failures still use the existing Zod errors; adopting a shorter import requires no data conversion.

## Validation and ownership

`tests/schema-compatibility/exports.json` is the frozen historical inventory captured from `fd8402c57c49f98c4cf3fe16022bd63424159532` before implementation, not a discovery of the new exports. It contains 151 Data API and 49 OAuth exports. `behavior.json` records historical metadata and literal values from the original revision. Do not regenerate these baselines from migrated code: that could hide deleted exports. The type fixture exhaustively checks the map against built declarations, including OAuth-client re-exports. `pnpm test:schema-compatibility` runs identity, declaration documentation, type equivalence, module import, behavior, and canonical-consumer checks. OAuth schema declares this suite as its test command; normal `pnpm verify` builds dependencies before running it.

Both OpenAPI helper dependency closures were built, followed by `pnpm codegen:openapi:api`, `pnpm codegen:openapi:api:yaml`, `pnpm codegen:openapi:oauth`, and `pnpm codegen:openapi:oauth:yaml`. The four regenerated contracts are unchanged. Generated SDK sources and docs require no migration; the full generated verification checks their freshness.

## Release and rollback

This is an additive API migration. Release the independent schema packages before the OAuth client, whose canonical imports and re-exports depend on the new OAuth schema. Proposed versions are API schema `0.0.1-alpha.2`, OAuth schema `0.1.0`, and OAuth client `0.0.1-alpha.11`. No generated SDK release is required for unchanged outputs. Generators and examples are private consumers. Publishing is a separate action and is not part of this change.

Users can migrate imports incrementally. Keep deprecated exports indefinitely within this work; removal requires a separately approved breaking release. Before publication, rollback by reverting the migration. Once canonical names are published, corrective releases must retain both naming surfaces.

## Complete historical map

| Original module                                | Kind  | Historical symbol                                           | Canonical replacement                                |
| ---------------------------------------------- | ----- | ----------------------------------------------------------- | ---------------------------------------------------- |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingAuthParametersSchema`                               | `AuthParametersSchema`                               |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingDriverStatsByCategoryPathSchema`                    | `DriverStatsByCategoryPathSchema`                    |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingHostedCombinedSessionsParametersSchema`             | `HostedCombinedSessionsParametersSchema`             |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueCustomerSessionsParametersSchema`             | `LeagueCustomerSessionsParametersSchema`             |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueDirectoryParametersSchema`                    | `LeagueDirectoryParametersSchema`                    |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueGetParametersSchema`                          | `LeagueGetParametersSchema`                          |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueGetPointsSystemsParametersSchema`             | `LeagueGetPointsSystemsParametersSchema`             |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueMembershipParametersSchema`                   | `LeagueMembershipParametersSchema`                   |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueRosterParametersSchema`                       | `LeagueRosterParametersSchema`                       |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueSeasonsParametersSchema`                      | `LeagueSeasonsParametersSchema`                      |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueSeasonStandingsParametersSchema`              | `LeagueSeasonStandingsParametersSchema`              |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLeagueSeasonSessionsParametersSchema`               | `LeagueSeasonSessionsParametersSchema`               |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingLookupDriversParametersSchema`                      | `LookupDriversParametersSchema`                      |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingMemberAwardsParametersSchema`                       | `MemberAwardsParametersSchema`                       |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingMemberAwardInstancesParametersSchema`               | `MemberAwardInstancesParametersSchema`               |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingMemberChartDataParametersSchema`                    | `MemberChartDataParametersSchema`                    |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingMemberGetParametersSchema`                          | `MemberGetParametersSchema`                          |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingMemberProfileParametersSchema`                      | `MemberProfileParametersSchema`                      |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingResultsGetParametersSchema`                         | `ResultsGetParametersSchema`                         |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingResultsEventLogParametersSchema`                    | `ResultsEventLogParametersSchema`                    |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingResultsLapChartDataParametersSchema`                | `ResultsLapChartDataParametersSchema`                |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingResultsLapDataParametersSchema`                     | `ResultsLapDataParametersSchema`                     |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingResultsSearchHostedParametersSchema`                | `ResultsSearchHostedParametersSchema`                |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingResultsSearchSeriesParametersSchema`                | `ResultsSearchSeriesParametersSchema`                |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingResultsSeasonResultsParametersSchema`               | `ResultsSeasonResultsParametersSchema`               |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeasonListParametersSchema`                         | `SeasonListParametersSchema`                         |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeasonRaceGuideParametersSchema`                    | `SeasonRaceGuideParametersSchema`                    |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeasonSpectatorSubsessionidsParametersSchema`       | `SeasonSpectatorSubsessionidsParametersSchema`       |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeasonSpectatorSubsessionidsDetailParametersSchema` | `SeasonSpectatorSubsessionidsDetailParametersSchema` |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeriesPastSeasonsParametersSchema`                  | `SeriesPastSeasonsParametersSchema`                  |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeriesSeasonsParametersSchema`                      | `SeriesSeasonsParametersSchema`                      |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeriesSeasonListParametersSchema`                   | `SeriesSeasonListParametersSchema`                   |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingSeriesSeasonScheduleParametersSchema`               | `SeriesSeasonScheduleParametersSchema`               |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsMemberBestsParametersSchema`                   | `StatsMemberBestsParametersSchema`                   |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsMemberCareerParametersSchema`                  | `StatsMemberCareerParametersSchema`                  |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsMemberDivisionParametersSchema`                | `StatsMemberDivisionParametersSchema`                |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsMemberRecapParametersSchema`                   | `StatsMemberRecapParametersSchema`                   |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsMemberRecentRacesParametersSchema`             | `StatsMemberRecentRacesParametersSchema`             |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsMemberSummaryParametersSchema`                 | `StatsMemberSummaryParametersSchema`                 |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsMemberYearlyParametersSchema`                  | `StatsMemberYearlyParametersSchema`                  |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsSeasonDriverStandingsParametersSchema`         | `StatsSeasonDriverStandingsParametersSchema`         |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsSeasonSupersessionStandingsParametersSchema`   | `StatsSeasonSupersessionStandingsParametersSchema`   |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsSeasonTeamStandingsParametersSchema`           | `StatsSeasonTeamStandingsParametersSchema`           |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsSeasonTTStandingsParametersSchema`             | `StatsSeasonTTStandingsParametersSchema`             |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsSeasonTTResultsParametersSchema`               | `StatsSeasonTTResultsParametersSchema`               |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsSeasonQualifyResultsParametersSchema`          | `StatsSeasonQualifyResultsParametersSchema`          |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingStatsWorldRecordsParametersSchema`                  | `StatsWorldRecordsParametersSchema`                  |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingTeamGetParametersSchema`                            | `TeamGetParametersSchema`                            |
| `packages/api/schema/src/schema/parameters.ts` | const | `IRacingTimeAttackMemberSeasonResultsParametersSchema`      | `TimeAttackMemberSeasonResultsParametersSchema`      |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingDriverStatsByCategoryPath`                          | `DriverStatsByCategoryPath`                          |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingHostedCombinedSessionsParameters`                   | `HostedCombinedSessionsParameters`                   |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueCustomerSessionsParameters`                   | `LeagueCustomerSessionsParameters`                   |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueDirectoryParameters`                          | `LeagueDirectoryParameters`                          |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueGetParameters`                                | `LeagueGetParameters`                                |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueGetPointsSystemsParameters`                   | `LeagueGetPointsSystemsParameters`                   |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueMembershipParameters`                         | `LeagueMembershipParameters`                         |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueRosterParameters`                             | `LeagueRosterParameters`                             |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueSeasonsParameters`                            | `LeagueSeasonsParameters`                            |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueSeasonStandingsParameters`                    | `LeagueSeasonStandingsParameters`                    |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLeagueSeasonSessionsParameters`                     | `LeagueSeasonSessionsParameters`                     |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingLookupDriversParameters`                            | `LookupDriversParameters`                            |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingMemberAwardsParameters`                             | `MemberAwardsParameters`                             |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingMemberAwardInstancesParameters`                     | `MemberAwardInstancesParameters`                     |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingMemberChartDataParameters`                          | `MemberChartDataParameters`                          |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingMemberGetParameters`                                | `MemberGetParameters`                                |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingMemberProfileParameters`                            | `MemberProfileParameters`                            |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingResultsGetParameters`                               | `ResultsGetParameters`                               |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingResultsEventLogParameters`                          | `ResultsEventLogParameters`                          |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingResultsLapChartDataParameters`                      | `ResultsLapChartDataParameters`                      |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingResultsLapDataParameters`                           | `ResultsLapDataParameters`                           |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingResultsSearchHostedParameters`                      | `ResultsSearchHostedParameters`                      |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingResultsSearchSeriesParameters`                      | `ResultsSearchSeriesParameters`                      |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingResultsSeasonResultsParameters`                     | `ResultsSeasonResultsParameters`                     |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeasonListParameters`                               | `SeasonListParameters`                               |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeasonRaceGuideParameters`                          | `SeasonRaceGuideParameters`                          |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeasonSpectatorSubsessionidsParameters`             | `SeasonSpectatorSubsessionidsParameters`             |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeasonSpectatorSubsessionidsDetailParameters`       | `SeasonSpectatorSubsessionidsDetailParameters`       |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeriesPastSeasonsParameters`                        | `SeriesPastSeasonsParameters`                        |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeriesSeasonsParameters`                            | `SeriesSeasonsParameters`                            |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeriesSeasonListParameters`                         | `SeriesSeasonListParameters`                         |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingSeriesSeasonScheduleParameters`                     | `SeriesSeasonScheduleParameters`                     |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsMemberBestsParameters`                         | `StatsMemberBestsParameters`                         |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsMemberCareerParameters`                        | `StatsMemberCareerParameters`                        |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsMemberDivisionParameters`                      | `StatsMemberDivisionParameters`                      |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsMemberRecapParameters`                         | `StatsMemberRecapParameters`                         |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsMemberRecentRacesParameters`                   | `StatsMemberRecentRacesParameters`                   |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsMemberSummaryParameters`                       | `StatsMemberSummaryParameters`                       |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsMemberYearlyParameters`                        | `StatsMemberYearlyParameters`                        |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsSeasonDriverStandingsParameters`               | `StatsSeasonDriverStandingsParameters`               |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsSeasonSupersessionStandingsParameters`         | `StatsSeasonSupersessionStandingsParameters`         |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsSeasonTeamStandingsParameters`                 | `StatsSeasonTeamStandingsParameters`                 |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsSeasonTTStandingsParameters`                   | `StatsSeasonTTStandingsParameters`                   |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsSeasonTTResultsParameters`                     | `StatsSeasonTTResultsParameters`                     |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsSeasonQualifyResultsParameters`                | `StatsSeasonQualifyResultsParameters`                |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingStatsWorldRecordsParameters`                        | `StatsWorldRecordsParameters`                        |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingTeamGetParameters`                                  | `TeamGetParameters`                                  |
| `packages/api/schema/src/schema/parameters.ts` | type  | `IRacingTimeAttackMemberSeasonResultsParameters`            | `TimeAttackMemberSeasonResultsParameters`            |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingAccessTokenSchema`                                  | `AccessTokenSchema`                                  |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingRateLimitLimitHeaderKey`                            | `RateLimitLimitHeaderKey`                            |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingRateLimitLimitHeaderSchema`                         | `RateLimitLimitHeaderSchema`                         |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingRateLimitRemainingHeaderKey`                        | `RateLimitRemainingHeaderKey`                        |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingRateLimitRemainingHeaderSchema`                     | `RateLimitRemainingHeaderSchema`                     |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingRateLimitResetHeaderKey`                            | `RateLimitResetHeaderKey`                            |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingRateLimitResetHeaderSchema`                         | `RateLimitResetHeaderSchema`                         |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingRateLimitHeadersSchema`                             | `RateLimitHeadersSchema`                             |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingCustomerIdSchema`                                   | `CustomerIdSchema`                                   |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingEventTypePracticeSchema`                            | `EventTypePracticeSchema`                            |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingEventTypeQualifyingSchema`                          | `EventTypeQualifyingSchema`                          |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingEventTypeTimeTrialSchema`                           | `EventTypeTimeTrialSchema`                           |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingEventTypeRaceSchema`                                | `EventTypeRaceSchema`                                |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingEventTypeSchema`                                    | `EventTypeSchema`                                    |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingChartTypeSchema`                                    | `ChartTypeSchema`                                    |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingChartTypeParameterSchema`                           | `ChartTypeParameterSchema`                           |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingCategorySchema`                                     | `CategorySchema`                                     |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingCategoryIdSchema`                                   | `CategoryIdSchema`                                   |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingCategoryIdParameterSchema`                          | `CategoryIdParameterSchema`                          |
| `packages/api/schema/src/schema/primitives.ts` | const | `IRacingDivisionSchema`                                     | `DivisionSchema`                                     |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingAccessToken`                                        | `AccessToken`                                        |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingRateLimitLimitHeader`                               | `RateLimitLimitHeader`                               |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingRateLimitRemainingHeader`                           | `RateLimitRemainingHeader`                           |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingRateLimitResetHeader`                               | `RateLimitResetHeader`                               |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingRateLimitHeaders`                                   | `RateLimitHeaders`                                   |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingCustomerId`                                         | `CustomerId`                                         |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingCategory`                                           | `Category`                                           |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingDivision`                                           | `Division`                                           |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingEventTypePractice`                                  | `EventTypePractice`                                  |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingEventTypeQualifying`                                | `EventTypeQualifying`                                |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingEventTypeTimeTrial`                                 | `EventTypeTimeTrial`                                 |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingEventTypeRace`                                      | `EventTypeRace`                                      |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingEventType`                                          | `EventType`                                          |
| `packages/api/schema/src/schema/primitives.ts` | type  | `IRacingChartType`                                          | `ChartType`                                          |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingErrorResponseSchema`                                | `ErrorResponseSchema`                                |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingAPIResponseSchema`                                  | `APIResponseSchema`                                  |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingServiceMethodParametersDocsResponseSchema`          | `ServiceMethodParametersDocsResponseSchema`          |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingServiceMethodDocsResponseSchema`                    | `ServiceMethodDocsResponseSchema`                    |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingServiceDocsResponseSchema`                          | `ServiceDocsResponseSchema`                          |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingServicesDocsResponseSchema`                         | `ServicesDocsResponseSchema`                         |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingGetCarAssetsResponseSchema`                         | `GetCarAssetsResponseSchema`                         |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingGetCarResponseSchema`                               | `GetCarResponseSchema`                               |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingGetTrackAssetsResponseSchema`                       | `GetTrackAssetsResponseSchema`                       |
| `packages/api/schema/src/schema/responses.ts`  | const | `IRacingGetTrackResponseSchema`                             | `GetTrackResponseSchema`                             |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingErrorResponse`                                      | `ErrorResponse`                                      |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingAPIResponse`                                        | `APIResponse`                                        |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingServiceMethodParametersDocsResponse`                | `ServiceMethodParametersDocsResponse`                |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingServiceMethodDocsResponse`                          | `ServiceMethodDocsResponse`                          |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingServiceDocsResponse`                                | `ServiceDocsResponse`                                |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingServicesDocsResponse`                               | `ServicesDocsResponse`                               |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingGetCarAssetsResponse`                               | `GetCarAssetsResponse`                               |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingGetCarResponse`                                     | `GetCarResponse`                                     |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingGetTrackAssetsResponse`                             | `GetTrackAssetsResponse`                             |
| `packages/api/schema/src/schema/responses.ts`  | type  | `IRacingGetTrackResponse`                                   | `GetTrackResponse`                                   |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthClientIdSchema`                                | `OAuthClientIdSchema`                                |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthClientSecretSchema`                            | `OAuthClientSecretSchema`                            |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthScopeAuthSchema`                               | `OAuthScopeAuthSchema`                               |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthScopeProfileSchema`                            | `OAuthScopeProfileSchema`                            |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthScopesSchema`                                  | `OAuthScopesSchema`                                  |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthScopesStringSchema`                            | `OAuthScopesStringSchema`                            |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthRequestIdHeaderKey`                            | `OAuthRequestIdHeaderKey`                            |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthRequestIdHeaderSchema`                         | `OAuthRequestIdHeaderSchema`                         |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthHeadersSchema`                                 | `OAuthHeadersSchema`                                 |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthErrorResponseSchema`                           | `OAuthErrorResponseSchema`                           |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthAuthorizeParametersSchema`                     | `OAuthAuthorizeParametersSchema`                     |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthCllbackParametersSchema`                       | `OAuthCallbackParametersSchema`                      |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthTokenAuthorizationCodeGrantParametersSchema`   | `OAuthTokenAuthorizationCodeGrantParametersSchema`   |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthTokenRefreshGrantParametersSchema`             | `OAuthTokenRefreshGrantParametersSchema`             |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthPasswordLimitedGrantParametersSchema`          | `OAuthPasswordLimitedGrantParametersSchema`          |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthTokenParametersSchema`                         | `OAuthTokenParametersSchema`                         |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthTokenResponseSchema`                           | `OAuthTokenResponseSchema`                           |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthJWTAccessTokenAlgorithmValues`                 | `OAuthJWTAccessTokenAlgorithmValues`                 |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthJWTAccessTokenAlgorithmSchema`                 | `OAuthJWTAccessTokenAlgorithmSchema`                 |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthJWTAccessTokenHeaderSchema`                    | `OAuthJWTAccessTokenHeaderSchema`                    |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthJWTAccessTokenPayloadSchema`                   | `OAuthJWTAccessTokenPayloadSchema`                   |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthJWTAccessTokenSchema`                          | `OAuthJWTAccessTokenSchema`                          |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthSessionSchema`                                 | `OAuthSessionSchema`                                 |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthSessionsSchema`                                | `OAuthSessionsSchema`                                |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthProfileResponseSchema`                         | `OAuthProfileResponseSchema`                         |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthRevokeCurrentSessionInputSchema`               | `OAuthRevokeCurrentSessionInputSchema`               |
| `packages/oauth/schema/src/schema.ts`          | const | `IRacingOAuthRevokeSessionsInputSchema`                     | `OAuthRevokeSessionsInputSchema`                     |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthClientId`                                      | `OAuthClientId`                                      |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthClientSecret`                                  | `OAuthClientSecret`                                  |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthScopeAuth`                                     | `OAuthScopeAuth`                                     |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthScopeProfile`                                  | `OAuthScopeProfile`                                  |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthScopes`                                        | `OAuthScopes`                                        |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthScopesString`                                  | `OAuthScopesString`                                  |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthRequestIdHeader`                               | `OAuthRequestIdHeader`                               |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthHeaders`                                       | `OAuthHeaders`                                       |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthAuthorizeParameters`                           | `OAuthAuthorizeParameters`                           |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthTokenAuthorizationCodeGrantParameters`         | `OAuthTokenAuthorizationCodeGrantParameters`         |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthTokenRefreshGrantParameters`                   | `OAuthTokenRefreshGrantParameters`                   |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthTokenParameters`                               | `OAuthTokenParameters`                               |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthTokenResponse`                                 | `OAuthTokenResponse`                                 |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthJWTAccessTokenAlgorithm`                       | `OAuthJWTAccessTokenAlgorithm`                       |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthJWTAccessTokenHeader`                          | `OAuthJWTAccessTokenHeader`                          |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthJWTAccessTokenPayload`                         | `OAuthJWTAccessTokenPayload`                         |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthJWTAccessToken`                                | `OAuthJWTAccessToken`                                |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthSession`                                       | `OAuthSession`                                       |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthSessions`                                      | `OAuthSessions`                                      |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthProfileResponse`                               | `OAuthProfileResponse`                               |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthRevokeCurrentSessionParameters`                | `OAuthRevokeCurrentSessionParameters`                |
| `packages/oauth/schema/src/schema.ts`          | type  | `IRacingOAuthRevokeSessionsParameters`                      | `OAuthRevokeSessionsParameters`                      |

## Implementation validation

Engineering review checked declaration-module access, wildcard re-exports, canonical-name collisions through consumer builds, direct alias identity, type/codec equivalence, and unchanged schema metadata. Product compatibility review checked incremental adoption, editor replacement hints, continued old imports, unchanged errors, and release/rollback policy.

Passed: `pnpm verify:js` (including schema, OAuth-client, router, and new compatibility tests), `pnpm verify:examples`, `pnpm verify:generated`, `pnpm verify:rust`, `pnpm lint`, formatting of edited files, and `git diff --check`. Rust checks retain existing generated-code warnings; the Rust package currently has no runtime tests. Generated freshness verification regenerated all SDKs in isolation and found every committed OpenAPI/client artifact reproducible.

`pnpm verify` stopped at repository-wide formatting on 11 untouched files under `examples/oauth-password-limited/output/`. These pre-existing output files were preserved. All preceding repository checks passed; the remaining verification groups were run separately as listed above. `pnpm impact --base fd8402c57c49f98c4cf3fe16022bd63424159532` was run against the clean pre-migration base before commits; its broad dependency candidates were reviewed against unchanged generated output, rather than treated as automatic releases.
