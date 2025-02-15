import axios, { AxiosInstance, AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import {
  CacheExpiredError,
  InvalidResponseData,
  IRacingAuthenticationError,
} from "./error";

const DEFAULT_IRACING_DATA_API_URL = "https://members-ng.iracing.com/";

type IRacingAPIResponse = {
  // A link to the cached data
  link: string;
  // An ISO 8601 date string
  expires: string;
};

export class IRacingAPI {
  private axiosInstance: AxiosInstance;
  private cookieJar: CookieJar;

  constructor(
    url: string = DEFAULT_IRACING_DATA_API_URL,
    cookieJar: CookieJar = new CookieJar()
  ) {
    this.cookieJar = cookieJar;
    this.axiosInstance = wrapper(
      axios.create({
        baseURL: url,
        withCredentials: true, // Ensure cookies are sent and received
        jar: this.cookieJar,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  }

  hasValidSession() {
    const cookies = this.cookieJar.getCookiesSync(DEFAULT_IRACING_DATA_API_URL);
    // Ensure that every cookie is not-expired
    return cookies.length
      ? cookies.every((cookie) => {
          if (cookie.TTL() > 0) {
            return true;
          }

          return false;
        })
      : false;
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
  getCarAssets() {
    return this.axiosInstance.get("/data/car/assets");
  }

  getCar() {
    return this.axiosInstance.get("/data/car/get");
  }

  // Car Class Endpoints
  getCarClass() {
    return this.axiosInstance.get("/data/carclass/get");
  }

  // Constants Endpoints
  getCategories() {
    return this.axiosInstance.get("/data/constants/categories");
  }

  getDivisions() {
    return this.axiosInstance.get("/data/constants/divisions");
  }

  getEventTypes() {
    return this.axiosInstance.get("/data/constants/event_types");
  }

  // Driver Stats Endpoints
  getDriverStatsByCategory(category: string) {
    return this.axiosInstance.get(`/data/driver_stats_by_category/${category}`);
  }

  // Hosted Sessions
  getHostedCombinedSessions(packageId?: number) {
    return this.axiosInstance.get("/data/hosted/combined_sessions", {
      params: packageId ? { package_id: packageId } : {},
    });
  }

  getHostedSessions() {
    return this.axiosInstance.get("/data/hosted/sessions");
  }

  // League Endpoints
  getLeagueSessions(mine?: boolean, packageId?: number) {
    return this.axiosInstance.get("/data/league/cust_league_sessions", {
      params: { mine, package_id: packageId },
    });
  }

  getLeagueDirectory(params?: Record<string, any>) {
    return this.axiosInstance.get("/data/league/directory", { params });
  }

  async getLeague(leagueId: number, includeLicenses?: boolean) {
    const response = await this.axiosInstance.get("/data/league/get", {
      params: { league_id: leagueId, include_licenses: includeLicenses },
    });

    return this.fetchValidLinkData(response.data);
  }

  getLeagueMembership(custId?: number, includeLeague?: boolean) {
    return this.axiosInstance.get("/data/league/membership", {
      params: { cust_id: custId, include_league: includeLeague },
    });
  }

  getLeagueRoster(leagueId: number, includeLicenses?: boolean) {
    return this.axiosInstance.get("/data/league/roster", {
      params: { league_id: leagueId, include_licenses: includeLicenses },
    });
  }

  getLeagueSeasons(leagueId: number, retired?: boolean) {
    return this.axiosInstance.get("/data/league/seasons", {
      params: { league_id: leagueId, retired },
    });
  }

  getLeagueSeasonStandings(
    leagueId: number,
    seasonId: number,
    carClassId?: number,
    carId?: number
  ) {
    return this.axiosInstance.get("/data/league/season_standings", {
      params: {
        league_id: leagueId,
        season_id: seasonId,
        car_class_id: carClassId,
        car_id: carId,
      },
    });
  }

  // Lookup Endpoints
  getCountries() {
    return this.axiosInstance.get("/data/lookup/countries");
  }

  searchDrivers(searchTerm: string, leagueId?: number) {
    return this.axiosInstance.get("/data/lookup/drivers", {
      params: { search_term: searchTerm, league_id: leagueId },
    });
  }

  // Member Endpoints
  getMemberAwards(custId?: number) {
    return this.axiosInstance.get("/data/member/awards", {
      params: { cust_id: custId },
    });
  }

  getMemberInfo() {
    return this.axiosInstance.get("/data/member/info");
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

  // Results Endpoints
  getRaceResults(subsessionId: number, includeLicenses?: boolean) {
    return this.axiosInstance.get("/data/results/get", {
      params: {
        subsession_id: subsessionId,
        include_licenses: includeLicenses,
      },
    });
  }

  getLapData(
    subsessionId: number,
    simsessionNumber: number,
    custId?: number,
    teamId?: number
  ) {
    return this.axiosInstance.get("/data/results/lap_data", {
      params: {
        subsession_id: subsessionId,
        simsession_number: simsessionNumber,
        cust_id: custId,
        team_id: teamId,
      },
    });
  }

  searchHostedResults(params: Record<string, any>) {
    return this.axiosInstance.get("/data/results/search_hosted", { params });
  }

  // Season Endpoints
  getSeasonList(seasonYear: number, seasonQuarter: number) {
    return this.axiosInstance.get("/data/season/list", {
      params: { season_year: seasonYear, season_quarter: seasonQuarter },
    });
  }

  getRaceGuide(from?: string, includeEndAfterFrom?: boolean) {
    return this.axiosInstance.get("/data/season/race_guide", {
      params: { from, include_end_after_from: includeEndAfterFrom },
    });
  }

  // Series Endpoints
  getSeries() {
    return this.axiosInstance.get("/data/series/get");
  }

  getSeriesPastSeasons(seriesId: number) {
    return this.axiosInstance.get("/data/series/past_seasons", {
      params: { series_id: seriesId },
    });
  }

  // Stats Endpoints
  getMemberCareerStats(custId?: number) {
    return this.axiosInstance.get("/data/stats/member_career", {
      params: { cust_id: custId },
    });
  }

  getSeasonDriverStandings(
    seasonId: number,
    carClassId: number,
    clubId?: number,
    division?: number,
    raceWeekNum?: number
  ) {
    return this.axiosInstance.get("/data/stats/season_driver_standings", {
      params: {
        season_id: seasonId,
        car_class_id: carClassId,
        club_id: clubId,
        division,
        race_week_num: raceWeekNum,
      },
    });
  }

  // Track Endpoints
  getTrackAssets() {
    return this.axiosInstance.get("/data/track/assets");
  }

  getTrackInfo() {
    return this.axiosInstance.get("/data/track/get");
  }
}

export default IRacingAPI;
