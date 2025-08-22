import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { IRacingAPI, NetworkClientProvider } from "./api";
import { IRacingAuthenticationError } from "./types";
import { allCookiesValid, fetchValidLinkData } from "./util";

const DEFAULT_IRACING_DATA_API_URL = "https://members-ng.iracing.com/";

/**
 * A wrapper class for the IRacingAPI that provides convenience methods for
 * interacting with the API.
 */
export class IRacingAPIClient extends NetworkClientProvider {
  private _api: IRacingAPI;
  get api() {
    return this._api;
  }

  constructor(client: AxiosInstance) {
    super(client);
    this._api = new IRacingAPI(client);
  }

  // /auth

  /**
   * Authenticate with the iRacing API.
   * !!!: This must be called before making requests to the `/data` endpoints.
   * @param input: An object containing the username and password
   * @returns If successful, the response data from the API
   * @throws IRacingAuthenticationError if the authentication fails
   */
  async authenticate(input: Parameters<IRacingAPI["auth"]["auth"]>[0]) {
    const response = await this.api.auth.auth(input);

    if (response.status === 200) {
      return response.data;
    }

    throw new IRacingAuthenticationError();
  }

  // /data

  async doc() {
    const response = await this.api.data.doc();
    return response.data;
  }

  // /data/car

  async carAssets() {
    const response = await this.api.data.car.assets();
    return fetchValidLinkData(response.data);
  }

  async carGet() {
    const response = await this.api.data.car.get();
    return fetchValidLinkData(response.data);
  }

  // /data/carclass

  async carClassGet() {
    const response = await this.api.data.carClass.get();
    return fetchValidLinkData(response.data);
  }

  // /data/constants

  async constantsCategories() {
    const response = await this.api.data.constants.categories();
    return fetchValidLinkData(response.data);
  }

  async constantsDivisions() {
    const response = await this.api.data.constants.divisions();
    return fetchValidLinkData(response.data);
  }

  async constantsEventTypes() {
    const response = await this.api.data.constants.eventTypes();
    return fetchValidLinkData(response.data);
  }

  // /data/driver_stats_by_category

  async driverStatsByCategory(
    input: Parameters<IRacingAPI["data"]["driverStats"]["category"]>[0]
  ) {
    const response = await this.api.data.driverStats.category(input);
    return fetchValidLinkData(response.data);
  }

  // /data/hosted

  async hostedCombinedSessions(
    input: Parameters<IRacingAPI["data"]["hosted"]["combinedSessions"]>[0]
  ) {
    const response = await this.api.data.hosted.combinedSessions(input);
    return fetchValidLinkData(response.data);
  }

  async hostedSessions() {
    const response = await this.api.data.hosted.sessions();
    return fetchValidLinkData(response.data);
  }

  // /data/league

  async leagueDirectory(
    input: Parameters<IRacingAPI["data"]["league"]["directory"]>[0] = {}
  ) {
    const response = await this.api.data.league.directory(input);
    return fetchValidLinkData(response.data);
  }

  async leagueCustomerLeagueSessions(
    input: Parameters<
      IRacingAPI["data"]["league"]["customerLeagueSessions"]
    >[0] = {}
  ) {
    const response = await this.api.data.league.customerLeagueSessions(input);
    return fetchValidLinkData(response.data);
  }

  async leagueGet(input: Parameters<IRacingAPI["data"]["league"]["get"]>[0]) {
    const response = await this.api.data.league.get(input);
    return fetchValidLinkData(response.data);
  }

  async leagueGetPointsSystems(
    input: Parameters<IRacingAPI["data"]["league"]["getPointsSystems"]>[0]
  ) {
    const response = await this.api.data.league.getPointsSystems(input);
    return fetchValidLinkData(response.data);
  }

  async leagueMembership(
    input: Parameters<IRacingAPI["data"]["league"]["membership"]>[0]
  ) {
    const response = await this.api.data.league.membership(input);
    return fetchValidLinkData(response.data);
  }

  async leagueRoster(
    input: Parameters<IRacingAPI["data"]["league"]["roster"]>[0]
  ) {
    const response = await this.api.data.league.roster(input);
    return fetchValidLinkData(response.data);
  }

  async leagueSeasons(
    input: Parameters<IRacingAPI["data"]["league"]["seasons"]>[0]
  ) {
    const response = await this.api.data.league.seasons(input);
    return fetchValidLinkData(response.data);
  }

  async leagueSeasonStandings(
    input: Parameters<IRacingAPI["data"]["league"]["seasonStandings"]>[0]
  ) {
    const response = await this.api.data.league.seasonStandings(input);
    return fetchValidLinkData(response.data);
  }

  async leagueSeasonSessions(
    input: Parameters<IRacingAPI["data"]["league"]["seasonSessions"]>[0]
  ) {
    const response = await this.api.data.league.seasonSessions(input);
    return fetchValidLinkData(response.data);
  }

  // /data/lookup

  async lookupCountries() {
    const response = await this.api.data.lookup.countries();
    return fetchValidLinkData(response.data);
  }

  async lookupDrivers(
    input: Parameters<IRacingAPI["data"]["lookup"]["drivers"]>[0]
  ) {
    const response = await this.api.data.lookup.drivers(input);
    return fetchValidLinkData(response.data);
  }

  async lookupGet(input: Parameters<IRacingAPI["data"]["lookup"]["get"]>[0]) {
    const response = await this.api.data.lookup.get(input);
    return fetchValidLinkData(response.data);
  }

  async lookupLicenses() {
    const response = await this.api.data.lookup.licenses();
    return fetchValidLinkData(response.data);
  }

  // /data/member

  async memberAwards(
    input: Parameters<IRacingAPI["data"]["member"]["awards"]>[0]
  ) {
    const response = await this.api.data.member.awards(input);
    return fetchValidLinkData(response.data);
  }

  async memberAwardInstances(
    input: Parameters<IRacingAPI["data"]["member"]["awardInstances"]>[0]
  ) {
    const response = await this.api.data.member.awardInstances(input);
    return fetchValidLinkData(response.data);
  }

  async memberChartData(
    input: Parameters<IRacingAPI["data"]["member"]["chartData"]>[0]
  ) {
    const response = await this.api.data.member.chartData(input);
    return fetchValidLinkData(response.data);
  }

  async memberGet(input: Parameters<IRacingAPI["data"]["member"]["get"]>[0]) {
    const response = await this.api.data.member.get(input);
    return fetchValidLinkData(response.data);
  }

  async memberInfo() {
    const response = await this.api.data.member.info();
    return fetchValidLinkData(response.data);
  }

  async memberParticipationCredits() {
    const response = await this.api.data.member.participationCredits();
    return fetchValidLinkData(response.data);
  }

  async memberProfile(
    input: Parameters<IRacingAPI["data"]["member"]["profile"]>[0]
  ) {
    const response = await this.api.data.member.profile(input);
    return fetchValidLinkData(response.data);
  }

  // /data/results

  async resultsGet(input: Parameters<IRacingAPI["data"]["results"]["get"]>[0]) {
    const response = await this.api.data.results.get(input);
    return fetchValidLinkData(response.data);
  }

  async resultsEventLog(
    input: Parameters<IRacingAPI["data"]["results"]["eventLog"]>[0]
  ) {
    const response = await this.api.data.results.eventLog(input);
    return fetchValidLinkData(response.data);
  }

  async resultsLapChartData(
    input: Parameters<IRacingAPI["data"]["results"]["lapChartData"]>[0]
  ) {
    const response = await this.api.data.results.lapChartData(input);
    return fetchValidLinkData(response.data);
  }

  async resultsLapData(
    input: Parameters<IRacingAPI["data"]["results"]["lapData"]>[0]
  ) {
    const response = await this.api.data.results.lapData(input);
    return fetchValidLinkData(response.data);
  }

  async resultsSearchHosted(
    input: Parameters<IRacingAPI["data"]["results"]["searchHosted"]>[0] = {}
  ) {
    const response = await this.api.data.results.searchHosted(input);
    return fetchValidLinkData(response.data);
  }

  async resultsSearchSeries(
    input: Parameters<IRacingAPI["data"]["results"]["searchSeries"]>[0]
  ) {
    const response = await this.api.data.results.searchSeries(input);
    return fetchValidLinkData(response.data);
  }

  async resultsSeasonResults(
    input: Parameters<IRacingAPI["data"]["results"]["seasonResults"]>[0]
  ) {
    const response = await this.api.data.results.seasonResults(input);
    return fetchValidLinkData(response.data);
  }

  // /data/season

  async seasonList(input: Parameters<IRacingAPI["data"]["season"]["list"]>[0]) {
    const response = await this.api.data.season.list(input);
    return fetchValidLinkData(response.data);
  }

  async seasonRaceGuide(
    input: Parameters<IRacingAPI["data"]["season"]["raceGuide"]>[0]
  ) {
    const response = await this.api.data.season.raceGuide(input);
    return fetchValidLinkData(response.data);
  }

  async seasonSpectatorSubsessionIds(
    input: Parameters<IRacingAPI["data"]["season"]["spectatorSubsessionIds"]>[0]
  ) {
    const response = await this.api.data.season.spectatorSubsessionIds(input);
    return fetchValidLinkData(response.data);
  }

  async seasonSpectatorSubsessionIdsDetail(
    input: Parameters<
      IRacingAPI["data"]["season"]["spectatorSubsessionIdsDetail"]
    >[0]
  ) {
    const response = await this.api.data.season.spectatorSubsessionIdsDetail(
      input
    );
    return fetchValidLinkData(response.data);
  }

  // /data/series

  async seriesAssets() {
    const response = await this.api.data.series.assets();
    return fetchValidLinkData(response.data);
  }

  async seriesGet() {
    const response = await this.api.data.series.get();
    return fetchValidLinkData(response.data);
  }

  async seriesPastSeasons(
    input: Parameters<IRacingAPI["data"]["series"]["pastSeasons"]>[0]
  ) {
    const response = await this.api.data.series.pastSeasons(input);
    return fetchValidLinkData(response.data);
  }

  async seriesSeasons(
    input: Parameters<IRacingAPI["data"]["series"]["seasons"]>[0]
  ) {
    const response = await this.api.data.series.seasons(input);
    return fetchValidLinkData(response.data);
  }

  async seriesStatsSeries() {
    const response = await this.api.data.series.statsSeries();
    return fetchValidLinkData(response.data);
  }

  // /data/stats

  async statsMemberBests(
    input: Parameters<IRacingAPI["data"]["stats"]["memberBests"]>[0]
  ) {
    const response = await this.api.data.stats.memberBests(input);
    return fetchValidLinkData(response.data);
  }

  async statsMemberCareer(
    input: Parameters<IRacingAPI["data"]["stats"]["memberCareer"]>[0]
  ) {
    const response = await this.api.data.stats.memberCareer(input);
    return fetchValidLinkData(response.data);
  }

  async statsMemberDivision(
    input: Parameters<IRacingAPI["data"]["stats"]["memberDivision"]>[0]
  ) {
    const response = await this.api.data.stats.memberDivision(input);
    return fetchValidLinkData(response.data);
  }

  async statsMemberRecap(
    input: Parameters<IRacingAPI["data"]["stats"]["memberRecap"]>[0]
  ) {
    const response = await this.api.data.stats.memberRecap(input);
    return fetchValidLinkData(response.data);
  }

  async statsMemberRecentRaces(
    input: Parameters<IRacingAPI["data"]["stats"]["memberRecentRaces"]>[0]
  ) {
    const response = await this.api.data.stats.memberRecentRaces(input);
    return fetchValidLinkData(response.data);
  }

  async statsMemberSummary(
    input: Parameters<IRacingAPI["data"]["stats"]["memberSummary"]>[0]
  ) {
    const response = await this.api.data.stats.memberSummary(input);
    return fetchValidLinkData(response.data);
  }

  async statsMemberYearly(
    input: Parameters<IRacingAPI["data"]["stats"]["memberYearly"]>[0]
  ) {
    const response = await this.api.data.stats.memberYearly(input);
    return fetchValidLinkData(response.data);
  }

  async statsSeasonDriverStandings(
    input: Parameters<IRacingAPI["data"]["stats"]["seasonDriverStandings"]>[0]
  ) {
    const response = await this.api.data.stats.seasonDriverStandings(input);
    return fetchValidLinkData(response.data);
  }

  async statsSeasonSupersessionStandings(
    input: Parameters<
      IRacingAPI["data"]["stats"]["seasonSupersessionStandings"]
    >[0]
  ) {
    const response = await this.api.data.stats.seasonSupersessionStandings(
      input
    );
    return fetchValidLinkData(response.data);
  }

  async statsSeasonTeamStandings(
    input: Parameters<IRacingAPI["data"]["stats"]["seasonTeamStandings"]>[0]
  ) {
    const response = await this.api.data.stats.seasonTeamStandings(input);
    return fetchValidLinkData(response.data);
  }

  async statsSeasonTimeTrialStandings(
    input: Parameters<
      IRacingAPI["data"]["stats"]["seasonTimeTrialStandings"]
    >[0]
  ) {
    const response = await this.api.data.stats.seasonTimeTrialStandings(input);
    return fetchValidLinkData(response.data);
  }

  async statsSeasonTimeTrialResults(
    input: Parameters<IRacingAPI["data"]["stats"]["seasonTimeTrialResults"]>[0]
  ) {
    const response = await this.api.data.stats.seasonTimeTrialResults(input);
    return fetchValidLinkData(response.data);
  }

  async statsSeasonQualifyResults(
    input: Parameters<IRacingAPI["data"]["stats"]["seasonQualifyResults"]>[0]
  ) {
    const response = await this.api.data.stats.seasonQualifyResults(input);
    return fetchValidLinkData(response.data);
  }

  async statsWorldRecords(
    input: Parameters<IRacingAPI["data"]["stats"]["worldRecords"]>[0]
  ) {
    const response = await this.api.data.stats.worldRecords(input);
    return fetchValidLinkData(response.data);
  }

  // /data/team

  async teamGet(input: Parameters<IRacingAPI["data"]["team"]["get"]>[0]) {
    const response = await this.api.data.team.get(input);
    return fetchValidLinkData(response.data);
  }

  // /data/time_attack

  async timeAttackMemberSeasonResults(
    input: Parameters<
      IRacingAPI["data"]["timeAttack"]["memberSeasonResults"]
    >[0]
  ) {
    const response = await this.api.data.timeAttack.memberSeasonResults(input);
    return fetchValidLinkData(response.data);
  }

  // /data/track

  async trackAssets() {
    const response = await this.api.data.track.assets();
    return fetchValidLinkData(response.data);
  }

  async trackGet() {
    const response = await this.api.data.track.get();
    return fetchValidLinkData(response.data);
  }
}

export class IRacingAPISessionClient extends IRacingAPIClient {
  get cookieJar() {
    return this._cookieJar;
  }

  constructor(private _cookieJar: CookieJar = new CookieJar()) {
    const client = wrapper(
      axios.create({
        baseURL: DEFAULT_IRACING_DATA_API_URL,
        withCredentials: true,
        jar: _cookieJar,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    super(client);
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
}

export default IRacingAPIClient;
