import axios, { AxiosInstance, AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import {
  CacheExpiredError,
  InvalidResponseData,
  IRacingAuthenticationError,
} from "./error";
import { CategoryValue, IRacingAPIResponse } from "./types";
import { allCookiesValid } from "./util";

const DEFAULT_IRACING_DATA_API_URL = "https://members-ng.iracing.com/";

export class IRacingAPI {
  private axiosInstance: AxiosInstance;
  private _cookieJar: CookieJar;
  get cookieJar() {
    return this._cookieJar;
  }

  constructor(cookieJar: CookieJar = new CookieJar()) {
    this._cookieJar = cookieJar;
    this.axiosInstance = wrapper(
      axios.create({
        baseURL: DEFAULT_IRACING_DATA_API_URL,
        withCredentials: true, // Ensure cookies are sent and received
        jar: this.cookieJar,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  }

  /**
   * Checks if we have a valid session and returns the email of the currently logged in user.
   * @returns the email of the currently logged in user or null
   */
  whoami(): string | null {
    const cookies = this.cookieJar.getCookiesSync(DEFAULT_IRACING_DATA_API_URL);
    if (allCookiesValid(cookies)) {
      const authTokenCookie = cookies.find(
        (cookie) => cookie.key === "authtoken_members"
      );

      if (authTokenCookie) {
        const { authtoken: { email = null } = {} } =
          JSON.parse(decodeURIComponent(authTokenCookie.value)) || {};

        return email;
      }
    }

    return null;
  }

  /**
   * Authenticate with the iRacing API.
   * This must be called before making requests to the `/data` endpoints.
   * It stores authentication cookies for future use.
   */
  async authenticate(username: string, password: string): Promise<any> {
    const response = await this.axiosInstance.post("/auth", {
      email: username,
      password: password,
    });

    if (response.status === 200) {
      console.log("✅ Authentication successful");
      return response.data;
    }

    throw new IRacingAuthenticationError();
  }

  private async fetchValidLinkData(response: IRacingAPIResponse) {
    if (!response || !response.link || !response.expires) {
      throw new InvalidResponseData();
    }

    const expirationDate = new Date(response.expires);
    const now = new Date();

    if (expirationDate < now) {
      throw new CacheExpiredError();
    }

    const data = await this.axiosInstance.get(response.link, {
      responseType: "json",
    });

    return data.data;
  }

  async getDoc() {
    const response = await this.axiosInstance.get<Record<string, any>>(
      "/data/doc"
    );

    return response.data;
  }

  // Car Endpoints
  async getCarAssets() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/car/assets"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getCar() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/car/get"
    );
    return this.fetchValidLinkData(response.data);
  }

  // Car Class Endpoints
  async getCarClass() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/carclass/get"
    );
    return this.fetchValidLinkData(response.data);
  }

  // Constants Endpoints
  async getCategories() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/constants/categories"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getDivisions() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/constants/divisions"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getEventTypes() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/constants/event_types"
    );

    return this.fetchValidLinkData(response.data);
  }

  // Driver Stats Endpoints
  async getDriverStatsByCategory(category: CategoryValue) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      `/data/driver_stats_by_category/${category}`
    );

    return this.fetchValidLinkData(response.data);
  }

  // Hosted Sessions
  async getHostedCombinedSessions(packageId?: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/hosted/combined_sessions",
      {
        params: packageId ? { package_id: packageId } : {},
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getHostedSessions() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/hosted/sessions"
    );
    return this.fetchValidLinkData(response.data);
  }

  // League Endpoints
  async getLeagueSessions(mine?: boolean, packageId?: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/cust_league_sessions",
      {
        params: { mine, package_id: packageId },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getLeagueDirectory(params?: Record<string, any>) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/directory",
      {
        params,
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getLeague(leagueId: number, includeLicenses?: boolean) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/get",
      {
        params: { league_id: leagueId, include_licenses: includeLicenses },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getLeagueMembership(custId?: number, includeLeague?: boolean) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/membership",
      {
        params: { cust_id: custId, include_league: includeLeague },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getLeagueRoster(leagueId: number, includeLicenses?: boolean) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/roster",
      {
        params: { league_id: leagueId, include_licenses: includeLicenses },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getLeagueSeasons(leagueId: number, retired?: boolean) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/seasons",
      {
        params: { league_id: leagueId, retired },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getLeagueSeasonStandings(
    leagueId: number,
    seasonId: number,
    carClassId?: number,
    carId?: number
  ) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/season_standings",
      {
        params: {
          league_id: leagueId,
          season_id: seasonId,
          car_class_id: carClassId,
          car_id: carId,
        },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getPointsSystems(leagueId: number, seasonId?: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/get_points_systems",
      {
        params: {
          league_id: leagueId,
          ...(seasonId && { season_id: seasonId }),
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonSessions(
    leagueId: number,
    seasonId: number,
    resultsOnly?: boolean
  ) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/league/season_sessions",
      {
        params: {
          league_id: leagueId,
          season_id: seasonId,
          results_only: resultsOnly,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  // Lookup Endpoints
  async getCountries() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/lookup/countries"
    );
    return this.fetchValidLinkData(response.data);
  }

  async searchDrivers(searchTerm: string, leagueId?: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/lookup/drivers",
      {
        params: { search_term: searchTerm, league_id: leagueId },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getClubHistory(seasonYear: number, seasonQuarter: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/lookup/club_history",
      {
        params: { season_year: seasonYear, season_quarter: seasonQuarter },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async lookupGet(): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/lookup/get"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getLicenses() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/lookup/licenses"
    );
    return this.fetchValidLinkData(response.data);
  }

  // Member Endpoints
  async getMemberAwards(custId?: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/member/awards",
      {
        params: { cust_id: custId },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getMemberInfo() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/member/info"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getMemberProfile(custId?: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/member/profile",
      {
        params: { cust_id: custId },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getAwardInstances(custId: number, awardId: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/member/award_instances",
      {
        params: { cust_id: custId, award_id: awardId },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getChartData(
    custId: number,
    categoryId: number,
    chartType: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/member/chart_data",
      {
        params: {
          cust_id: custId,
          category_id: categoryId,
          chart_type: chartType,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getMemberGet(
    custIds: number[],
    includeLicenses?: boolean
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/member/get",
      {
        params: {
          cust_ids: custIds.join(","),
          include_licenses: includeLicenses,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getParticipationCredits(): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/member/participation_credits"
    );
    return this.fetchValidLinkData(response.data);
  }

  // Results Endpoints
  async getRaceResults(subsessionId: number, includeLicenses?: boolean) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/results/get",
      {
        params: {
          subsession_id: subsessionId,
          include_licenses: includeLicenses,
        },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getLapData(
    subsessionId: number,
    simsessionNumber: number,
    custId?: number,
    teamId?: number
  ) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/results/lap_data",
      {
        params: {
          subsession_id: subsessionId,
          simsession_number: simsessionNumber,
          cust_id: custId,
          team_id: teamId,
        },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async searchHostedResults(params: Record<string, any>) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/results/search_hosted",
      { params }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getEventLog(
    subsessionId: number,
    simsessionNumber: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/results/event_log",
      {
        params: {
          subsession_id: subsessionId,
          simsession_number: simsessionNumber,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getLapChartData(
    subsessionId: number,
    simsessionNumber: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/results/lap_chart_data",
      {
        params: {
          subsession_id: subsessionId,
          simsession_number: simsessionNumber,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async searchSeries(params: Record<string, any>): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/results/search_series",
      { params }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonResults(
    seasonId: number,
    eventType: number,
    raceWeekNum?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/results/season_results",
      {
        params: {
          season_id: seasonId,
          event_type: eventType,
          race_week_num: raceWeekNum,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  // Season Endpoints
  async getSeasonList(seasonYear: number, seasonQuarter: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/season/list",
      {
        params: { season_year: seasonYear, season_quarter: seasonQuarter },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getRaceGuide(from?: string, includeEndAfterFrom?: boolean) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/season/race_guide",
      {
        params: { from, include_end_after_from: includeEndAfterFrom },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getSpectatorSubsessionIds(eventTypes?: number[]): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/season/spectator_subsessionids",
      {
        params: { event_types: eventTypes ? eventTypes.join(",") : undefined },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSpectatorSubsessionIdsDetail(
    eventTypes?: number[],
    seasonIds?: number[]
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/season/spectator_subsessionids_detail",
      {
        params: {
          event_types: eventTypes ? eventTypes.join(",") : undefined,
          season_ids: seasonIds ? seasonIds.join(",") : undefined,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  // Series Endpoints
  async getSeries() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/series/get"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeriesPastSeasons(seriesId: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/series/past_seasons",
      {
        params: { series_id: seriesId },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getSeriesAssets(): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/series/assets"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeriesSeasons(includeSeries?: boolean): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/series/seasons",
      {
        params: { include_series: includeSeries },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getStatsSeries(): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/series/stats_series"
    );
    return this.fetchValidLinkData(response.data);
  }

  // Stats Endpoints
  async getMemberCareerStats(custId?: number) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/member_career",
      {
        params: { cust_id: custId },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getSeasonDriverStandings(
    seasonId: number,
    carClassId: number,
    clubId?: number,
    division?: number,
    raceWeekNum?: number
  ) {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/season_driver_standings",
      {
        params: {
          season_id: seasonId,
          car_class_id: carClassId,
          club_id: clubId,
          division,
          race_week_num: raceWeekNum,
        },
      }
    );

    return this.fetchValidLinkData(response.data);
  }

  async getMemberBests(custId?: number): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/member_bests",
      {
        params: { cust_id: custId },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getMemberDivision(seasonId: number, eventType: number): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/member_division",
      {
        params: { season_id: seasonId, event_type: eventType },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getMemberRecap(
    custId?: number,
    year?: number,
    season?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/member_recap",
      {
        params: { cust_id: custId, year, season },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getMemberRecentRaces(custId?: number): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/member_recent_races",
      {
        params: { cust_id: custId },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getMemberSummary(custId?: number): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/member_summary",
      {
        params: { cust_id: custId },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getMemberYearly(custId?: number): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/member_yearly",
      {
        params: { cust_id: custId },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonSupersessionStandings(
    seasonId: number,
    carClassId: number,
    clubId?: number,
    division?: number,
    raceWeekNum?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/season_supersession_standings",
      {
        params: {
          season_id: seasonId,
          car_class_id: carClassId,
          club_id: clubId,
          division,
          race_week_num: raceWeekNum,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonTeamStandings(
    seasonId: number,
    carClassId: number,
    raceWeekNum?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/season_team_standings",
      {
        params: {
          season_id: seasonId,
          car_class_id: carClassId,
          race_week_num: raceWeekNum,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonTTStandings(
    seasonId: number,
    carClassId: number,
    clubId?: number,
    division?: number,
    raceWeekNum?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/season_tt_standings",
      {
        params: {
          season_id: seasonId,
          car_class_id: carClassId,
          club_id: clubId,
          division,
          race_week_num: raceWeekNum,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonTTResults(
    seasonId: number,
    carClassId: number,
    raceWeekNum: number,
    clubId?: number,
    division?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/season_tt_results",
      {
        params: {
          season_id: seasonId,
          car_class_id: carClassId,
          race_week_num: raceWeekNum,
          club_id: clubId,
          division,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonQualifyResults(
    seasonId: number,
    carClassId: number,
    raceWeekNum: number,
    clubId?: number,
    division?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/season_qualify_results",
      {
        params: {
          season_id: seasonId,
          car_class_id: carClassId,
          race_week_num: raceWeekNum,
          club_id: clubId,
          division,
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  async getWorldRecords(
    carId: number,
    trackId: number,
    seasonYear?: number,
    seasonQuarter?: number
  ): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/stats/world_records",
      {
        params: {
          car_id: carId,
          track_id: trackId,
          ...(seasonYear && { season_year: seasonYear }),
          ...(seasonQuarter && { season_quarter: seasonQuarter }),
        },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  // Track Endpoints
  async getTrackAssets() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/track/assets"
    );
    return this.fetchValidLinkData(response.data);
  }

  async getTrackInfo() {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/track/get"
    );
    return this.fetchValidLinkData(response.data);
  }

  // Team endpoint
  async getTeam(teamId: number, includeLicenses?: boolean): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/team/get",
      {
        params: { team_id: teamId, include_licenses: includeLicenses },
      }
    );
    return this.fetchValidLinkData(response.data);
  }

  // Time Attack endpoint
  async getMemberSeasonResults(taCompSeasonId: number): Promise<any> {
    const response = await this.axiosInstance.get<IRacingAPIResponse>(
      "/data/time_attack/member_season_results",
      {
        params: { ta_comp_season_id: taCompSeasonId },
      }
    );
    return this.fetchValidLinkData(response.data);
  }
}

export default IRacingAPI;
