# iRacing Data API Rust client

Typed Rust client generated from this repository's maintained iRacing Data API OpenAPI contract. OAuth authentication is managed separately; configure a bearer access token for Data API requests.

## Installation

```toml
[dependencies]
iracing-data-api-client = { version = "0.1.0", features = ["rustls-tls"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Install the independently versioned crate from [crates.io](https://crates.io/crates/iracing-data-api-client) once the desired version is published. The repository version may be ahead of published releases. HTTPS requires `rustls-tls` (shown above) or `native-tls`; the crate has no default TLS feature.

## First Data API call

Obtain an iRacing OAuth bearer access token with permission to access the Data API and set `IRACING_ACCESS_TOKEN` in your environment. This crate does not acquire or refresh tokens. See the [authentication guidance](https://github.com/racedirector/iracing-data-api/tree/main/packages/oauth/client#readme) for the OAuth requirements and an independently maintained TypeScript authentication client.

In your application's `src/main.rs`:

```rust
use iracing_data_api_client::apis::{configuration::Configuration, doc_api};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut configuration = Configuration::new();
    configuration.bearer_access_token = Some(std::env::var("IRACING_ACCESS_TOKEN")?);
    let docs = doc_api::get_docs(&configuration).await?;
    println!("{docs:#?}");
    Ok(())
}
```

Run `cargo run` to request `/data/doc`. HTTP and token failures propagate as errors. For a member lookup that also follows the returned data link, see the authored [member example](https://github.com/racedirector/iracing-data-api/blob/main/crates/iracing-data-api-client/examples/get_member.rs). From a repository checkout, run:

```bash
cargo run -p iracing-data-api-client --features rustls-tls --example get_member -- --access-token "$IRACING_ACCESS_TOKEN" --customer-ids 378767 --include-licenses
```

## Reference, generation, and releases

The generated endpoint and model reference follows below; published Rust documentation is available on [docs.rs](https://docs.rs/iracing-data-api-client) after publication. The [Data API OpenAPI contract](https://github.com/racedirector/iracing-data-api/blob/main/openapi/iracing.json) is the source for generated Rust API code. Repository-owned presentation templates preserve this introduction and Cargo metadata during regeneration.

See [repository guidance](https://github.com/racedirector/iracing-data-api/blob/main/crates/iracing-data-api-client/AGENTS.md) for canonical sources and deterministic regeneration. The crate has its own Cargo version and release process; npm package versions do not select its version. Follow the [Rust release procedure](https://github.com/racedirector/iracing-data-api/blob/main/docs/RELEASING.md#rust-crate-releases) before publishing.

## License

[MIT](https://github.com/racedirector/iracing-data-api/blob/main/LICENSE).

## Documentation for API Endpoints

All URIs are relative to *https://members-ng.iracing.com*

| Class            | Method                                                                                                                | HTTP request                                            | Description                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------- |
| _AuthApi_        | [**post_auth**](docs/AuthApi.md#post_auth)                                                                            | **POST** /auth                                          |
| _CarApi_         | [**get_car**](docs/CarApi.md#get_car)                                                                                 | **GET** /data/car/get                                   |
| _CarApi_         | [**get_car_assets**](docs/CarApi.md#get_car_assets)                                                                   | **GET** /data/car/assets                                |
| _CarclassApi_    | [**get_car_class**](docs/CarclassApi.md#get_car_class)                                                                | **GET** /data/carclass/get                              | Gets car classes.                |
| _ConstantsApi_   | [**get_constants_categories**](docs/ConstantsApi.md#get_constants_categories)                                         | **GET** /data/constants/categories                      |
| _ConstantsApi_   | [**get_constants_divisions**](docs/ConstantsApi.md#get_constants_divisions)                                           | **GET** /data/constants/divisions                       |
| _ConstantsApi_   | [**get_constants_event_types**](docs/ConstantsApi.md#get_constants_event_types)                                       | **GET** /data/constants/event_types                     |
| _DocApi_         | [**get_car_assets_docs**](docs/DocApi.md#get_car_assets_docs)                                                         | **GET** /data/doc/car/assets                            |
| _DocApi_         | [**get_car_class_docs**](docs/DocApi.md#get_car_class_docs)                                                           | **GET** /data/doc/carclass                              |
| _DocApi_         | [**get_car_class_get_docs**](docs/DocApi.md#get_car_class_get_docs)                                                   | **GET** /data/doc/carclass/get                          |
| _DocApi_         | [**get_car_docs**](docs/DocApi.md#get_car_docs)                                                                       | **GET** /data/doc/car                                   |
| _DocApi_         | [**get_car_get_docs**](docs/DocApi.md#get_car_get_docs)                                                               | **GET** /data/doc/car/get                               |
| _DocApi_         | [**get_constants_categories_docs**](docs/DocApi.md#get_constants_categories_docs)                                     | **GET** /data/doc/constants/categories                  |
| _DocApi_         | [**get_constants_divisions_docs**](docs/DocApi.md#get_constants_divisions_docs)                                       | **GET** /data/doc/constants/divisions                   |
| _DocApi_         | [**get_constants_docs**](docs/DocApi.md#get_constants_docs)                                                           | **GET** /data/doc/constants                             |
| _DocApi_         | [**get_constants_event_types_docs**](docs/DocApi.md#get_constants_event_types_docs)                                   | **GET** /data/doc/constants/event_types                 |
| _DocApi_         | [**get_docs**](docs/DocApi.md#get_docs)                                                                               | **GET** /data/doc                                       |
| _DocApi_         | [**get_driver_stats_by_category_category_docs**](docs/DocApi.md#get_driver_stats_by_category_category_docs)           | **GET** /data/doc/driver_stats_by_category/{category}   |
| _DocApi_         | [**get_driver_stats_by_category_docs**](docs/DocApi.md#get_driver_stats_by_category_docs)                             | **GET** /data/doc/driver_stats_by_category              |
| _DocApi_         | [**get_hosted_combined_sessions_docs**](docs/DocApi.md#get_hosted_combined_sessions_docs)                             | **GET** /data/doc/hosted/combined_sessions              |
| _DocApi_         | [**get_hosted_docs**](docs/DocApi.md#get_hosted_docs)                                                                 | **GET** /data/doc/hosted                                |
| _DocApi_         | [**get_hosted_sessions_docs**](docs/DocApi.md#get_hosted_sessions_docs)                                               | **GET** /data/doc/hosted/sessions                       |
| _DocApi_         | [**get_league_customer_league_sessions_docs**](docs/DocApi.md#get_league_customer_league_sessions_docs)               | **GET** /data/doc/league/cust_league_sessions           |
| _DocApi_         | [**get_league_directory_docs**](docs/DocApi.md#get_league_directory_docs)                                             | **GET** /data/doc/league/directory                      |
| _DocApi_         | [**get_league_docs**](docs/DocApi.md#get_league_docs)                                                                 | **GET** /data/doc/league                                |
| _DocApi_         | [**get_league_get_docs**](docs/DocApi.md#get_league_get_docs)                                                         | **GET** /data/doc/league/get                            |
| _DocApi_         | [**get_league_get_points_systems_docs**](docs/DocApi.md#get_league_get_points_systems_docs)                           | **GET** /data/doc/league/get_points_systems             |
| _DocApi_         | [**get_league_membership_docs**](docs/DocApi.md#get_league_membership_docs)                                           | **GET** /data/doc/league/membership                     |
| _DocApi_         | [**get_league_roster_docs**](docs/DocApi.md#get_league_roster_docs)                                                   | **GET** /data/doc/league/roster                         |
| _DocApi_         | [**get_league_season_sessions_docs**](docs/DocApi.md#get_league_season_sessions_docs)                                 | **GET** /data/doc/league/season_sessions                |
| _DocApi_         | [**get_league_season_standings_docs**](docs/DocApi.md#get_league_season_standings_docs)                               | **GET** /data/doc/league/season_standings               |
| _DocApi_         | [**get_league_seasons_docs**](docs/DocApi.md#get_league_seasons_docs)                                                 | **GET** /data/doc/league/seasons                        |
| _DocApi_         | [**get_lookup_countries_docs**](docs/DocApi.md#get_lookup_countries_docs)                                             | **GET** /data/doc/lookup/countries                      |
| _DocApi_         | [**get_lookup_docs**](docs/DocApi.md#get_lookup_docs)                                                                 | **GET** /data/doc/lookup                                |
| _DocApi_         | [**get_lookup_drivers_docs**](docs/DocApi.md#get_lookup_drivers_docs)                                                 | **GET** /data/doc/lookup/drivers                        |
| _DocApi_         | [**get_lookup_flairs_docs**](docs/DocApi.md#get_lookup_flairs_docs)                                                   | **GET** /data/doc/lookup/flairs                         |
| _DocApi_         | [**get_lookup_get_docs**](docs/DocApi.md#get_lookup_get_docs)                                                         | **GET** /data/doc/lookup/get                            |
| _DocApi_         | [**get_lookup_licenses_docs**](docs/DocApi.md#get_lookup_licenses_docs)                                               | **GET** /data/doc/lookup/licenses                       |
| _DocApi_         | [**get_member_award_instances_docs**](docs/DocApi.md#get_member_award_instances_docs)                                 | **GET** /data/doc/member/award_instances                |
| _DocApi_         | [**get_member_awards_docs**](docs/DocApi.md#get_member_awards_docs)                                                   | **GET** /data/doc/member/awards                         |
| _DocApi_         | [**get_member_chart_data_docs**](docs/DocApi.md#get_member_chart_data_docs)                                           | **GET** /data/doc/member/chart_data                     |
| _DocApi_         | [**get_member_docs**](docs/DocApi.md#get_member_docs)                                                                 | **GET** /data/doc/member                                |
| _DocApi_         | [**get_member_get_docs**](docs/DocApi.md#get_member_get_docs)                                                         | **GET** /data/doc/member/get                            |
| _DocApi_         | [**get_member_info_docs**](docs/DocApi.md#get_member_info_docs)                                                       | **GET** /data/doc/member/info                           |
| _DocApi_         | [**get_member_participation_credits_docs**](docs/DocApi.md#get_member_participation_credits_docs)                     | **GET** /data/doc/member/participation_credits          |
| _DocApi_         | [**get_member_profile_docs**](docs/DocApi.md#get_member_profile_docs)                                                 | **GET** /data/doc/member/profile                        |
| _DocApi_         | [**get_results_docs**](docs/DocApi.md#get_results_docs)                                                               | **GET** /data/doc/results                               |
| _DocApi_         | [**get_results_event_log_docs**](docs/DocApi.md#get_results_event_log_docs)                                           | **GET** /data/doc/results/event_log                     |
| _DocApi_         | [**get_results_get_docs**](docs/DocApi.md#get_results_get_docs)                                                       | **GET** /data/doc/results/get                           |
| _DocApi_         | [**get_results_lap_chart_data_docs**](docs/DocApi.md#get_results_lap_chart_data_docs)                                 | **GET** /data/doc/results/lap_chart_data                |
| _DocApi_         | [**get_results_lap_data_docs**](docs/DocApi.md#get_results_lap_data_docs)                                             | **GET** /data/doc/results/lap_data                      |
| _DocApi_         | [**get_results_search_hosted_docs**](docs/DocApi.md#get_results_search_hosted_docs)                                   | **GET** /data/doc/results/search_hosted                 |
| _DocApi_         | [**get_results_search_series_docs**](docs/DocApi.md#get_results_search_series_docs)                                   | **GET** /data/doc/results/search_series                 |
| _DocApi_         | [**get_results_season_results_docs**](docs/DocApi.md#get_results_season_results_docs)                                 | **GET** /data/doc/results/season_results                |
| _DocApi_         | [**get_season_docs**](docs/DocApi.md#get_season_docs)                                                                 | **GET** /data/doc/season                                |
| _DocApi_         | [**get_season_list_docs**](docs/DocApi.md#get_season_list_docs)                                                       | **GET** /data/doc/season/list                           |
| _DocApi_         | [**get_season_race_guide_docs**](docs/DocApi.md#get_season_race_guide_docs)                                           | **GET** /data/doc/season/race_guide                     |
| _DocApi_         | [**get_season_spectator_subsession_ids_detail_docs**](docs/DocApi.md#get_season_spectator_subsession_ids_detail_docs) | **GET** /data/doc/season/spectator_subsessionids_detail |
| _DocApi_         | [**get_season_spectator_subsession_ids_docs**](docs/DocApi.md#get_season_spectator_subsession_ids_docs)               | **GET** /data/doc/season/spectator_subsessionids        |
| _DocApi_         | [**get_series_assets_docs**](docs/DocApi.md#get_series_assets_docs)                                                   | **GET** /data/doc/series/assets                         |
| _DocApi_         | [**get_series_docs**](docs/DocApi.md#get_series_docs)                                                                 | **GET** /data/doc/series                                |
| _DocApi_         | [**get_series_get_docs**](docs/DocApi.md#get_series_get_docs)                                                         | **GET** /data/doc/series/get                            |
| _DocApi_         | [**get_series_past_seasons_docs**](docs/DocApi.md#get_series_past_seasons_docs)                                       | **GET** /data/doc/series/past_seasons                   |
| _DocApi_         | [**get_series_season_list_docs**](docs/DocApi.md#get_series_season_list_docs)                                         | **GET** /data/doc/series/season_list                    |
| _DocApi_         | [**get_series_season_schedule_docs**](docs/DocApi.md#get_series_season_schedule_docs)                                 | **GET** /data/doc/series/season_schedule                |
| _DocApi_         | [**get_series_seasons_docs**](docs/DocApi.md#get_series_seasons_docs)                                                 | **GET** /data/doc/series/seasons                        |
| _DocApi_         | [**get_series_stats_series_docs**](docs/DocApi.md#get_series_stats_series_docs)                                       | **GET** /data/doc/series/stats_series                   |
| _DocApi_         | [**get_stats_docs**](docs/DocApi.md#get_stats_docs)                                                                   | **GET** /data/doc/stats                                 |
| _DocApi_         | [**get_stats_member_bests_docs**](docs/DocApi.md#get_stats_member_bests_docs)                                         | **GET** /data/doc/stats/member_bests                    |
| _DocApi_         | [**get_stats_member_career_docs**](docs/DocApi.md#get_stats_member_career_docs)                                       | **GET** /data/doc/stats/member_career                   |
| _DocApi_         | [**get_stats_member_division_docs**](docs/DocApi.md#get_stats_member_division_docs)                                   | **GET** /data/doc/stats/member_division                 |
| _DocApi_         | [**get_stats_member_recap_docs**](docs/DocApi.md#get_stats_member_recap_docs)                                         | **GET** /data/doc/stats/member_recap                    |
| _DocApi_         | [**get_stats_member_recent_races_docs**](docs/DocApi.md#get_stats_member_recent_races_docs)                           | **GET** /data/doc/stats/member_recent_races             |
| _DocApi_         | [**get_stats_member_summary_docs**](docs/DocApi.md#get_stats_member_summary_docs)                                     | **GET** /data/doc/stats/member_summary                  |
| _DocApi_         | [**get_stats_member_yearly_docs**](docs/DocApi.md#get_stats_member_yearly_docs)                                       | **GET** /data/doc/stats/member_yearly                   |
| _DocApi_         | [**get_stats_season_driver_standings_docs**](docs/DocApi.md#get_stats_season_driver_standings_docs)                   | **GET** /data/doc/stats/season_driver_standings         |
| _DocApi_         | [**get_stats_season_qualify_results_docs**](docs/DocApi.md#get_stats_season_qualify_results_docs)                     | **GET** /data/doc/stats/season_qualify_results          |
| _DocApi_         | [**get_stats_season_supersession_standings_docs**](docs/DocApi.md#get_stats_season_supersession_standings_docs)       | **GET** /data/doc/stats/season_supersession_standings   |
| _DocApi_         | [**get_stats_season_team_standings_docs**](docs/DocApi.md#get_stats_season_team_standings_docs)                       | **GET** /data/doc/stats/season_team_standings           |
| _DocApi_         | [**get_stats_season_tt_results_docs**](docs/DocApi.md#get_stats_season_tt_results_docs)                               | **GET** /data/doc/stats/season_tt_results               |
| _DocApi_         | [**get_stats_season_tt_standings_docs**](docs/DocApi.md#get_stats_season_tt_standings_docs)                           | **GET** /data/doc/stats/season_tt_standings             |
| _DocApi_         | [**get_stats_world_records_docs**](docs/DocApi.md#get_stats_world_records_docs)                                       | **GET** /data/doc/stats/world_records                   |
| _DocApi_         | [**get_team_docs**](docs/DocApi.md#get_team_docs)                                                                     | **GET** /data/doc/team                                  |
| _DocApi_         | [**get_team_get_docs**](docs/DocApi.md#get_team_get_docs)                                                             | **GET** /data/doc/team/get                              |
| _DocApi_         | [**get_team_membership_docs**](docs/DocApi.md#get_team_membership_docs)                                               | **GET** /data/doc/team/membership                       |
| _DocApi_         | [**get_time_attack_docs**](docs/DocApi.md#get_time_attack_docs)                                                       | **GET** /data/doc/time_attack                           |
| _DocApi_         | [**get_time_attack_member_season_results_docs**](docs/DocApi.md#get_time_attack_member_season_results_docs)           | **GET** /data/doc/time_attack/member_season_results     |
| _DocApi_         | [**get_track_assets_docs**](docs/DocApi.md#get_track_assets_docs)                                                     | **GET** /data/doc/track/assets                          |
| _DocApi_         | [**get_track_docs**](docs/DocApi.md#get_track_docs)                                                                   | **GET** /data/doc/track                                 |
| _DocApi_         | [**get_track_get_docs**](docs/DocApi.md#get_track_get_docs)                                                           | **GET** /data/doc/track/get                             |
| _DriverStatsApi_ | [**get_driver_stats_by_category**](docs/DriverStatsApi.md#get_driver_stats_by_category)                               | **GET** /data/driver_stats_by_category/{category}       |
| _HostedApi_      | [**get_hosted_combined_sessions**](docs/HostedApi.md#get_hosted_combined_sessions)                                    | **GET** /data/hosted/combined_sessions                  |
| _HostedApi_      | [**get_hosted_sessions**](docs/HostedApi.md#get_hosted_sessions)                                                      | **GET** /data/hosted/sessions                           |
| _LeagueApi_      | [**get_league**](docs/LeagueApi.md#get_league)                                                                        | **GET** /data/league/get                                |
| _LeagueApi_      | [**get_league_customer_league_sessions**](docs/LeagueApi.md#get_league_customer_league_sessions)                      | **GET** /data/league/cust_league_sessions               |
| _LeagueApi_      | [**get_league_directory**](docs/LeagueApi.md#get_league_directory)                                                    | **GET** /data/league/directory                          |
| _LeagueApi_      | [**get_league_membership**](docs/LeagueApi.md#get_league_membership)                                                  | **GET** /data/league/membership                         |
| _LeagueApi_      | [**get_league_points_systems**](docs/LeagueApi.md#get_league_points_systems)                                          | **GET** /data/league/get_points_systems                 |
| _LeagueApi_      | [**get_league_roster**](docs/LeagueApi.md#get_league_roster)                                                          | **GET** /data/league/roster                             |
| _LeagueApi_      | [**get_league_season_sessions**](docs/LeagueApi.md#get_league_season_sessions)                                        | **GET** /data/league/season_sessions                    |
| _LeagueApi_      | [**get_league_season_standings**](docs/LeagueApi.md#get_league_season_standings)                                      | **GET** /data/league/season_standings                   |
| _LeagueApi_      | [**get_league_seasons**](docs/LeagueApi.md#get_league_seasons)                                                        | **GET** /data/league/seasons                            |
| _LookupApi_      | [**get_lookup**](docs/LookupApi.md#get_lookup)                                                                        | **GET** /data/lookup/get                                |
| _LookupApi_      | [**get_lookup_countries**](docs/LookupApi.md#get_lookup_countries)                                                    | **GET** /data/lookup/countries                          |
| _LookupApi_      | [**get_lookup_drivers**](docs/LookupApi.md#get_lookup_drivers)                                                        | **GET** /data/lookup/drivers                            |
| _LookupApi_      | [**get_lookup_flairs**](docs/LookupApi.md#get_lookup_flairs)                                                          | **GET** /data/lookup/flairs                             |
| _LookupApi_      | [**get_lookup_licenses**](docs/LookupApi.md#get_lookup_licenses)                                                      | **GET** /data/lookup/licenses                           |
| _MemberApi_      | [**get_member**](docs/MemberApi.md#get_member)                                                                        | **GET** /data/member/get                                |
| _MemberApi_      | [**get_member_award_instances**](docs/MemberApi.md#get_member_award_instances)                                        | **GET** /data/member/award_instances                    |
| _MemberApi_      | [**get_member_awards**](docs/MemberApi.md#get_member_awards)                                                          | **GET** /data/member/awards                             |
| _MemberApi_      | [**get_member_chart_data**](docs/MemberApi.md#get_member_chart_data)                                                  | **GET** /data/member/chart_data                         |
| _MemberApi_      | [**get_member_info**](docs/MemberApi.md#get_member_info)                                                              | **GET** /data/member/info                               |
| _MemberApi_      | [**get_member_participation_credits**](docs/MemberApi.md#get_member_participation_credits)                            | **GET** /data/member/participation_credits              |
| _MemberApi_      | [**get_member_profile**](docs/MemberApi.md#get_member_profile)                                                        | **GET** /data/member/profile                            | Gets a requested user's profile. |
| _ResultsApi_     | [**get_results**](docs/ResultsApi.md#get_results)                                                                     | **GET** /data/results/get                               |
| _ResultsApi_     | [**get_results_event_log**](docs/ResultsApi.md#get_results_event_log)                                                 | **GET** /data/results/event_log                         |
| _ResultsApi_     | [**get_results_lap_chart_data**](docs/ResultsApi.md#get_results_lap_chart_data)                                       | **GET** /data/results/lap_chart_data                    |
| _ResultsApi_     | [**get_results_lap_data**](docs/ResultsApi.md#get_results_lap_data)                                                   | **GET** /data/results/lap_data                          |
| _ResultsApi_     | [**get_results_search_hosted**](docs/ResultsApi.md#get_results_search_hosted)                                         | **GET** /data/results/search_hosted                     |
| _ResultsApi_     | [**get_results_search_series**](docs/ResultsApi.md#get_results_search_series)                                         | **GET** /data/results/search_series                     |
| _ResultsApi_     | [**get_results_season_results**](docs/ResultsApi.md#get_results_season_results)                                       | **GET** /data/results/season_results                    |
| _SeasonApi_      | [**get_season_list**](docs/SeasonApi.md#get_season_list)                                                              | **GET** /data/season/list                               |
| _SeasonApi_      | [**get_season_race_guide**](docs/SeasonApi.md#get_season_race_guide)                                                  | **GET** /data/season/race_guide                         |
| _SeasonApi_      | [**get_season_spectator_subsession_ids**](docs/SeasonApi.md#get_season_spectator_subsession_ids)                      | **GET** /data/season/spectator_subsessionids            |
| _SeasonApi_      | [**get_season_spectator_subsession_ids_detail**](docs/SeasonApi.md#get_season_spectator_subsession_ids_detail)        | **GET** /data/season/spectator_subsessionids_detail     |
| _SeriesApi_      | [**get_series**](docs/SeriesApi.md#get_series)                                                                        | **GET** /data/series/get                                |
| _SeriesApi_      | [**get_series_assets**](docs/SeriesApi.md#get_series_assets)                                                          | **GET** /data/series/assets                             |
| _SeriesApi_      | [**get_series_past_seasons**](docs/SeriesApi.md#get_series_past_seasons)                                              | **GET** /data/series/past_seasons                       |
| _SeriesApi_      | [**get_series_season_list**](docs/SeriesApi.md#get_series_season_list)                                                | **GET** /data/series/season_list                        |
| _SeriesApi_      | [**get_series_season_schedule**](docs/SeriesApi.md#get_series_season_schedule)                                        | **GET** /data/series/season_schedule                    |
| _SeriesApi_      | [**get_series_seasons**](docs/SeriesApi.md#get_series_seasons)                                                        | **GET** /data/series/seasons                            |
| _SeriesApi_      | [**get_series_stats_series**](docs/SeriesApi.md#get_series_stats_series)                                              | **GET** /data/series/stats_series                       |
| _StatsApi_       | [**get_stats_member_bests**](docs/StatsApi.md#get_stats_member_bests)                                                 | **GET** /data/stats/member_bests                        |
| _StatsApi_       | [**get_stats_member_career**](docs/StatsApi.md#get_stats_member_career)                                               | **GET** /data/stats/member_career                       |
| _StatsApi_       | [**get_stats_member_division**](docs/StatsApi.md#get_stats_member_division)                                           | **GET** /data/stats/member_division                     |
| _StatsApi_       | [**get_stats_member_recap**](docs/StatsApi.md#get_stats_member_recap)                                                 | **GET** /data/stats/member_recap                        |
| _StatsApi_       | [**get_stats_member_recent_races**](docs/StatsApi.md#get_stats_member_recent_races)                                   | **GET** /data/stats/member_recent_races                 |
| _StatsApi_       | [**get_stats_member_summary**](docs/StatsApi.md#get_stats_member_summary)                                             | **GET** /data/stats/member_summary                      |
| _StatsApi_       | [**get_stats_member_yearly**](docs/StatsApi.md#get_stats_member_yearly)                                               | **GET** /data/stats/member_yearly                       |
| _StatsApi_       | [**get_stats_season_driver_standings**](docs/StatsApi.md#get_stats_season_driver_standings)                           | **GET** /data/stats/season_driver_standings             |
| _StatsApi_       | [**get_stats_season_qualify_results**](docs/StatsApi.md#get_stats_season_qualify_results)                             | **GET** /data/stats/season_qualify_results              |
| _StatsApi_       | [**get_stats_season_supersession_standings**](docs/StatsApi.md#get_stats_season_supersession_standings)               | **GET** /data/stats/season_supersession_standings       |
| _StatsApi_       | [**get_stats_season_team_standings**](docs/StatsApi.md#get_stats_season_team_standings)                               | **GET** /data/stats/season_team_standings               |
| _StatsApi_       | [**get_stats_season_time_trial_results**](docs/StatsApi.md#get_stats_season_time_trial_results)                       | **GET** /data/stats/season_tt_results                   |
| _StatsApi_       | [**get_stats_season_time_trial_standings**](docs/StatsApi.md#get_stats_season_time_trial_standings)                   | **GET** /data/stats/season_tt_standings                 |
| _StatsApi_       | [**get_stats_world_records**](docs/StatsApi.md#get_stats_world_records)                                               | **GET** /data/stats/world_records                       |
| _TeamApi_        | [**get_team**](docs/TeamApi.md#get_team)                                                                              | **GET** /data/team/get                                  |
| _TeamApi_        | [**get_team_membership**](docs/TeamApi.md#get_team_membership)                                                        | **GET** /data/team/membership                           |
| _TimeAttackApi_  | [**get_time_attack_member_season_results**](docs/TimeAttackApi.md#get_time_attack_member_season_results)              | **GET** /data/time_attack/member_season_results         |
| _TrackApi_       | [**get_track**](docs/TrackApi.md#get_track)                                                                           | **GET** /data/track/get                                 |
| _TrackApi_       | [**get_track_assets**](docs/TrackApi.md#get_track_assets)                                                             | **GET** /data/track/assets                              |

## Documentation For Models

- [ErrorResponse](docs/ErrorResponse.md)
- [IracingApiResponse](docs/IracingApiResponse.md)
- [IracingCategory](docs/IracingCategory.md)
- [IracingDivision](docs/IracingDivision.md)
- [IracingEventType](docs/IracingEventType.md)
- [IracingServiceMethodDocs](docs/IracingServiceMethodDocs.md)
- [IracingServiceMethodDocsNote](docs/IracingServiceMethodDocsNote.md)
- [IracingServiceMethodParametersDocs](docs/IracingServiceMethodParametersDocs.md)
- [PostAuthRequest](docs/PostAuthRequest.md)

To get access to the crate's generated documentation, use:

```
cargo doc --open
```

## Author
