import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import {
  CacheExpiredError,
  InvalidResponseData,
  IRacingAuthenticationError,
  IRacingAPIResponse,
} from "../types";
import { allCookiesValid } from "../util";
import CarAPI from "./car";
import CarClassAPI from "./car-class";
import ConstantsAPI from "./constants";
import DriverStatsAPI from "./driver-stats";
import HostedAPI from "./hosted";
import LeagueAPI from "./league";
import LookupAPI from "./lookup";
import MemberAPI from "./member";
import ResultsAPI from "./results";
import SeasonAPI from "./season";
import SeriesAPI from "./series";
import StatsAPI from "./stats";
import TeamAPI from "./team";
import TimeAttackAPI from "./time-attack";
import TrackAPI from "./track";

const DEFAULT_IRACING_DATA_API_URL = "https://members-ng.iracing.com/";

export class IRacingAPI {
  private axiosInstance: AxiosInstance;
  private _cookieJar: CookieJar;
  get cookieJar() {
    return this._cookieJar;
  }

  private _car: CarAPI;
  get car() {
    return this._car;
  }

  private _carClass: CarClassAPI;
  get carClass() {
    return this._carClass;
  }

  private _constants: ConstantsAPI;
  get constants() {
    return this._constants;
  }

  private _driverStats: DriverStatsAPI;
  get driverStats() {
    return this._driverStats;
  }

  private _hosted: HostedAPI;
  get hosted() {
    return this._hosted;
  }

  private _league: LeagueAPI;
  get league() {
    return this._league;
  }

  private _lookup: LookupAPI;
  get lookup() {
    return this._lookup;
  }

  private _member: MemberAPI;
  get member() {
    return this._member;
  }

  private _results: ResultsAPI;
  get results() {
    return this._results;
  }

  private _season: SeasonAPI;
  get season() {
    return this._season;
  }

  private _series: SeriesAPI;
  get series() {
    return this._series;
  }

  private _stats: StatsAPI;
  get stats() {
    return this._stats;
  }

  private _team: TeamAPI;
  get team() {
    return this._team;
  }

  private _timeAttack: TimeAttackAPI;
  get timeAttack() {
    return this._timeAttack;
  }

  private _track: TrackAPI;
  get track() {
    return this._track;
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

    this._car = new CarAPI(this.axiosInstance);
    this._carClass = new CarClassAPI(this.axiosInstance);
    this._constants = new ConstantsAPI(this.axiosInstance);
    this._driverStats = new DriverStatsAPI(this.axiosInstance);
    this._hosted = new HostedAPI(this.axiosInstance);
    this._league = new LeagueAPI(this.axiosInstance);
    this._lookup = new LookupAPI(this.axiosInstance);
    this._member = new MemberAPI(this.axiosInstance);
    this._results = new ResultsAPI(this.axiosInstance);
    this._season = new SeasonAPI(this.axiosInstance);
    this._series = new SeriesAPI(this.axiosInstance);
    this._stats = new StatsAPI(this.axiosInstance);
    this._team = new TeamAPI(this.axiosInstance);
    this._timeAttack = new TimeAttackAPI(this.axiosInstance);
    this._track = new TrackAPI(this.axiosInstance);
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
  async authenticate({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
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

    const data = await this.axiosInstance.get<Record<string, any>>(
      response.link,
      {
        responseType: "json",
      }
    );

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
    const response = await this._car.assets();
    return this.fetchValidLinkData(response.data);
  }

  async getCar() {
    const response = await this._car.get();
    return this.fetchValidLinkData(response.data);
  }

  // Car Class Endpoints
  async getCarClass() {
    const response = await this._carClass.get();
    return this.fetchValidLinkData(response.data);
  }

  // Constants Endpoints
  async getCategories() {
    const response = await this._constants.categories();
    return this.fetchValidLinkData(response.data);
  }

  async getDivisions() {
    const response = await this._constants.divisions();
    return this.fetchValidLinkData(response.data);
  }

  async getEventTypes() {
    const response = await this._constants.eventTypes();
    return this.fetchValidLinkData(response.data);
  }

  // Driver Stats Endpoints
  async getDriverStatsByCategory(
    input: Parameters<DriverStatsAPI["category"]>[0]
  ) {
    const response = await this._driverStats.category(input);
    return this.fetchValidLinkData(response.data);
  }

  // Hosted Sessions
  async getHostedCombinedSessions(
    input: Parameters<HostedAPI["combinedSessions"]>[0]
  ) {
    const response = await this._hosted.combinedSessions(input);
    return this.fetchValidLinkData(response.data);
  }

  async getHostedSessions() {
    const response = await this._hosted.sessions();
    return this.fetchValidLinkData(response.data);
  }

  // League Endpoints
  async getLeagueSessions(
    input: Parameters<LeagueAPI["customerLeagueSessions"]>[0] = {}
  ) {
    const response = await this._league.customerLeagueSessions(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLeagueDirectory(input: Parameters<LeagueAPI["directory"]>[0] = {}) {
    const response = await this._league.directory(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLeague(input: Parameters<LeagueAPI["get"]>[0]) {
    const response = await this._league.get(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLeagueMembership(
    input: Parameters<LeagueAPI["membership"]>[0] = {}
  ) {
    const response = await this._league.membership(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLeagueRoster(input: Parameters<LeagueAPI["roster"]>[0]) {
    const response = await this._league.roster(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLeagueSeasons(input: Parameters<LeagueAPI["seasons"]>[0]) {
    const response = await this._league.seasons(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLeagueSeasonStandings(
    input: Parameters<LeagueAPI["seasonStandings"]>[0]
  ) {
    const response = await this._league.seasonStandings(input);
    return this.fetchValidLinkData(response.data);
  }

  async getPointsSystems(input: Parameters<LeagueAPI["getPointsSystems"]>[0]) {
    const response = await this._league.getPointsSystems(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonSessions(input: Parameters<LeagueAPI["seasonSessions"]>[0]) {
    const response = await this._league.seasonSessions(input);
    return this.fetchValidLinkData(response.data);
  }

  // Lookup Endpoints
  async getCountries() {
    const response = await this._lookup.countries();
    return this.fetchValidLinkData(response.data);
  }

  async searchDrivers(input: Parameters<LookupAPI["drivers"]>[0]) {
    const response = await this._lookup.drivers(input);
    return this.fetchValidLinkData(response.data);
  }

  async getClubHistory(input: Parameters<LookupAPI["clubHistory"]>[0]) {
    const response = await this._lookup.clubHistory(input);
    return this.fetchValidLinkData(response.data);
  }

  async lookupGet(input: Parameters<LookupAPI["get"]>[0]) {
    const response = await this._lookup.get(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLicenses() {
    const response = await this._lookup.licenses();
    return this.fetchValidLinkData(response.data);
  }

  // Member Endpoints
  async getMemberAwards(input: Parameters<MemberAPI["awards"]>[0]) {
    const response = await this._member.awards(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberInfo() {
    const response = await this._member.info();
    return this.fetchValidLinkData(response.data);
  }

  async getMemberProfile(input: Parameters<MemberAPI["profile"]>[0]) {
    const response = await this._member.profile(input);
    return this.fetchValidLinkData(response.data);
  }

  async getAwardInstances(input: Parameters<MemberAPI["awardInstances"]>[0]) {
    const response = await this._member.awardInstances(input);
    return this.fetchValidLinkData(response.data);
  }

  async getChartData(input: Parameters<MemberAPI["chartData"]>[0]) {
    const response = await this._member.chartData(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberGet(input: Parameters<MemberAPI["get"]>[0]) {
    const response = await this._member.get(input);
    return this.fetchValidLinkData(response.data);
  }

  async getParticipationCredits() {
    const response = await this._member.participationCredits();
    return this.fetchValidLinkData(response.data);
  }

  // Results Endpoints
  async getRaceResults(input: Parameters<ResultsAPI["get"]>[0]) {
    const response = await this._results.get(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLapData(input: Parameters<ResultsAPI["lapData"]>[0]) {
    const response = await this._results.lapData(input);
    return this.fetchValidLinkData(response.data);
  }

  async searchHostedResults(
    input: Parameters<ResultsAPI["searchHosted"]>[0] = {}
  ) {
    const response = await this._results.searchHosted(input);
    return this.fetchValidLinkData(response.data);
  }

  async getEventLog(input: Parameters<ResultsAPI["eventLog"]>[0]) {
    const response = await this._results.eventLog(input);
    return this.fetchValidLinkData(response.data);
  }

  async getLapChartData(input: Parameters<ResultsAPI["lapChartData"]>[0]) {
    const response = await this._results.lapChartData(input);
    return this.fetchValidLinkData(response.data);
  }

  async searchSeries(input: Parameters<ResultsAPI["searchSeries"]>[0]) {
    const response = await this._results.searchSeries(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonResults(input: Parameters<ResultsAPI["seasonResults"]>[0]) {
    const response = await this._results.seasonResults(input);
    return this.fetchValidLinkData(response.data);
  }

  // Season Endpoints
  async getSeasonList(input: Parameters<SeasonAPI["list"]>[0]) {
    const response = await this._season.list(input);
    return this.fetchValidLinkData(response.data);
  }

  async getRaceGuide(input: Parameters<SeasonAPI["raceGuide"]>[0]) {
    const response = await this._season.raceGuide(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSpectatorSubsessionIds(
    input: Parameters<SeasonAPI["spectatorSubsessionIds"]>[0]
  ) {
    const response = await this._season.spectatorSubsessionIds(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSpectatorSubsessionIdsDetail(
    input: Parameters<SeasonAPI["spectatorSubsessionIdsDetail"]>[0]
  ) {
    const response = await this._season.spectatorSubsessionIdsDetail(input);
    return this.fetchValidLinkData(response.data);
  }

  // Series Endpoints
  async getSeries() {
    const response = await this._series.get();
    return this.fetchValidLinkData(response.data);
  }

  async getSeriesPastSeasons(input: Parameters<SeriesAPI["pastSeasons"]>[0]) {
    const response = await this._series.pastSeasons(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeriesAssets() {
    const response = await this._series.assets();
    return this.fetchValidLinkData(response.data);
  }

  async getSeriesSeasons(input: Parameters<SeriesAPI["seasons"]>[0]) {
    const response = await this._series.seasons(input);
    return this.fetchValidLinkData(response.data);
  }

  async getStatsSeries() {
    const response = await this._series.statsSeries();
    return this.fetchValidLinkData(response.data);
  }

  // Stats Endpoints
  async getMemberCareerStats(input: Parameters<StatsAPI["memberCareer"]>[0]) {
    const response = await this._stats.memberCareer(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonDriverStandings(
    input: Parameters<StatsAPI["seasonDriverStandings"]>[0]
  ) {
    const response = await this._stats.seasonDriverStandings(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberBests(input: Parameters<StatsAPI["memberBests"]>[0]) {
    const response = await this._stats.memberBests(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberDivision(input: Parameters<StatsAPI["memberDivision"]>[0]) {
    const response = await this._stats.memberDivision(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberRecap(input: Parameters<StatsAPI["memberRecap"]>[0]) {
    const response = await this._stats.memberRecap(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberRecentRaces(
    input: Parameters<StatsAPI["memberRecentRaces"]>[0]
  ) {
    const response = await this._stats.memberRecentRaces(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberSummary(input: Parameters<StatsAPI["memberSummary"]>[0]) {
    const response = await this._stats.memberSummary(input);
    return this.fetchValidLinkData(response.data);
  }

  async getMemberYearly(input: Parameters<StatsAPI["memberYearly"]>[0]) {
    const response = await this._stats.memberYearly(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonSupersessionStandings(
    input: Parameters<StatsAPI["seasonSupersessionStandings"]>[0]
  ) {
    const response = await this._stats.seasonSupersessionStandings(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonTeamStandings(
    input: Parameters<StatsAPI["seasonTeamStandings"]>[0]
  ) {
    const response = await this._stats.seasonTeamStandings(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonTTStandings(
    input: Parameters<StatsAPI["seasonTimeTrialStandings"]>[0]
  ) {
    const response = await this._stats.seasonTimeTrialStandings(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonTTResults(
    input: Parameters<StatsAPI["seasonTimeTrialResults"]>[0]
  ) {
    const response = await this._stats.seasonTimeTrialResults(input);
    return this.fetchValidLinkData(response.data);
  }

  async getSeasonQualifyResults(
    input: Parameters<StatsAPI["seasonQualifyResults"]>[0]
  ) {
    const response = await this._stats.seasonQualifyResults(input);
    return this.fetchValidLinkData(response.data);
  }

  async getWorldRecords(input: Parameters<StatsAPI["worldRecords"]>[0]) {
    const response = await this._stats.worldRecords(input);
    return this.fetchValidLinkData(response.data);
  }

  // Track Endpoints
  async getTrackAssets() {
    const response = await this._track.assets();
    return this.fetchValidLinkData(response.data);
  }

  async getTrackInfo() {
    const response = await this._track.get();
    return this.fetchValidLinkData(response.data);
  }

  // Team endpoint
  async getTeam(input: Parameters<TeamAPI["get"]>[0]) {
    const response = await this._team.get(input);
    return this.fetchValidLinkData(response.data);
  }

  // Time Attack endpoint
  async getMemberSeasonResults(
    input: Parameters<TimeAttackAPI["memberSeasonResults"]>[0]
  ) {
    const response = await this._timeAttack.memberSeasonResults(input);
    return this.fetchValidLinkData(response.data);
  }
}

export default IRacingAPI;
