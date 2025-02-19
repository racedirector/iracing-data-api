import { AxiosInstance } from "axios";
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
import { NetworkClientProvider } from "../../types";

export class DataAPI extends NetworkClientProvider {
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

  constructor(client: AxiosInstance) {
    super(client);
    this._car = new CarAPI(client);
    this._carClass = new CarClassAPI(client);
    this._constants = new ConstantsAPI(client);
    this._driverStats = new DriverStatsAPI(client);
    this._hosted = new HostedAPI(client);
    this._league = new LeagueAPI(client);
    this._lookup = new LookupAPI(client);
    this._member = new MemberAPI(client);
    this._results = new ResultsAPI(client);
    this._season = new SeasonAPI(client);
    this._series = new SeriesAPI(client);
    this._stats = new StatsAPI(client);
    this._team = new TeamAPI(client);
    this._timeAttack = new TimeAttackAPI(client);
    this._track = new TrackAPI(client);
  }

  async doc() {
    return this.client.get<Record<string, any>>("/data/doc");
  }
}
