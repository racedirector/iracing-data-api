#!/usr/bin/env node
import path from "path";
import inquirer from "inquirer";
import { Argument, Command } from "@commander-js/extra-typings";
import _, { noop } from "lodash";
import { CookieJar } from "tough-cookie";
import IRacingAPI, { CATEGORY_VALUES, assertCategory } from "@iracing-data/api";
import { JSONCookieStore } from "./storage";
import { hashPassword } from "./util";

const createCookieStore = (credentials: string) => {
  return new JSONCookieStore(credentials);
};

const createCookieJar = (credentials: string) => {
  return new CookieJar(createCookieStore(credentials));
};

const createAPI = (credentials: string) => {
  return new IRacingAPI(createCookieJar(credentials));
};

const categoryArg = new Argument(
  "<category>",
  "Category to fetch driver stats for"
)
  .choices(CATEGORY_VALUES)
  .argRequired();

/**
 * Main program instance that provides a common interface for the CLI tool.
 */
const program = new Command<[], {}, { credentials: string }>()
  .description("CLI tool for interacting with the iRacing API")
  .version("0.0.0")
  .option(
    "--credentials [path]",
    "Path to credentials file",
    path.join(__dirname, "cookies.json")
  );

/**
 * whoami command
 */
program
  .command("whoami")
  .description("Prints the current session information.")
  .action((_: {}, command) => {
    const { credentials } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(api.whoami() || "No session found.");
  });

/**
 * logout command
 */
program
  .command("logout")
  .description("Logs out of the current session.")
  .action((_, command) => {
    const { credentials } = command.optsWithGlobals();
    const cookieJar = createCookieJar(credentials);
    cookieJar.removeAllCookies(noop);
    console.log("Logged out.");
  });

/**
 * auth command
 */
program
  .command("auth")
  .description("Stores credentials for the iRacing API")
  .option("-u, --username <username>", "iRacing username")
  .action(async (_, command) => {
    const { credentials, username: usernameOption } = command.optsWithGlobals();

    const { username = usernameOption, password } = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: "Enter your username:",
        when: () => !usernameOption,
      },
      {
        type: "password",
        name: "password",
        message: "Enter your password:",
        mask: "*",
      },
    ]);

    console.log(`Authenticating with ${username}...`);
    const hashedPassword = await hashPassword(username, password);
    const api = createAPI(credentials);
    await api.authenticate(username, hashedPassword);
  });

/**
 * car-assets command
 */
program
  .command("car-assets")
  .description("Fetch car assets")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const carAssets = await api.getCarAssets();
    console.log(carAssets);
  });

/**
 * car command
 */
program
  .command("car")
  .description("Fetch car")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const car = await api.getCar();
    console.log(car);
  });

/**
 * car-class command
 */
program
  .command("car-class")
  .description("Fetch car class")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const carClass = await api.getCarClass();
    console.log(carClass);
  });

/**
 * categories command
 */
program
  .command("categories")
  .description("Fetch categories")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const categories = await api.getCategories();
    console.log(categories);
  });

/**
 * countries command
 */
program
  .command("countries")
  .description("Fetch countries")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const countries = await api.getCountries();
    console.log(countries);
  });

/**
 * divisions command
 */
program
  .command("divisions")
  .description("Fetch divisions")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const divisions = await api.getDivisions();
    console.log(divisions);
  });

/**
 * docs command
 */
program
  .command("docs")
  .description("Downloads the latest API documentation from `/data/doc`")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const docs = await api.getDoc();
    console.log(docs);
  });

/**
 * driver-stats
 */
program
  .command("driver-stats")
  .addArgument(categoryArg)
  .description("Fetch driver stats")
  .option("-o, --output <path>", "Output path")
  .action(async (category, _, command) => {
    assertCategory(category);

    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const driverStats = await api.getDriverStatsByCategory(category);
    console.log(driverStats);
  });

/**
 * event-types command
 */
program
  .command("event-types")
  .description("Fetch event types")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const eventTypes = await api.getEventTypes();
    console.log(eventTypes);
  });

/**
 * hosted command
 */
program
  .command("hosted")
  .description("Fetch hosted sessions")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const hostedSessions = await api.getHostedSessions();
    console.log(hostedSessions);
  });

/**
 * hosted-combined command
 */
program
  .command("hosted-combined")
  .description("Fetch hosted combined sessions")
  .option("-p, --package-id <packageId>", "Package ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output, packageId } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const hostedCombinedSessions = await api.getHostedCombinedSessions(
      packageId
    );
    console.log(hostedCombinedSessions);
  });

/**
 * lap-data command
 */
program
  .command("lap-data")
  .argument("<subsessionId>", "Subsession ID", parseInt)
  .argument("<sessionNum>", "Session number", parseInt)
  .description("Fetch lap data")
  .option("-c, --cust-id <custId>", "Customer ID", parseInt)
  .option("-t, --team-id <teamId>", "Team ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(async (subsessionId, sessionNumber, _, command) => {
    const { credentials, custId, teamId, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const lapData = await api.getLapData(
      subsessionId,
      sessionNumber,
      custId,
      teamId
    );
    console.log(lapData);
  });

/**
 * league command
 */
program
  .command("league")
  .argument("<leagueId>", "League ID", parseInt)
  .description("Fetch league")
  .option("-l, --include-licenses", "Include licenses")
  .option("-o, --output <path>", "Output path")
  .action(async (leagueId, _, command) => {
    const { credentials, includeLicenses, output } = command.optsWithGlobals();
    const api = createAPI(credentials);

    console.log(`Fetching league ${leagueId}...`);
    const league = await api.getLeague(leagueId, includeLicenses);

    console.log(league);
  });

/**
 * league-directory command
 */
program
  .command("league-directory")
  .description("Fetch league directory")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log("Fetching league directory...");
    console.log("TODO: Support params");
    const leagueDirectory = await api.getLeagueDirectory();
    console.log(leagueDirectory);
  });

/**
 * league-membership command
 */
program
  .command("league-membership")
  .argument("[custId]", "Customer ID", parseInt)
  .description("Fetch league membership")
  .option("-l, --include-league", "Include league")
  .option("-o, --output <path>", "Output path")
  .action(async (custId, _, command) => {
    const { credentials, includeLeague, output } = command.optsWithGlobals();
    const api = createAPI(credentials);

    console.log(`Fetching league membership for ${custId}...`);
    const leagueMembership = await api.getLeagueMembership(
      custId,
      includeLeague
    );

    console.log(leagueMembership);
  });

/**
 * league-roster command
 */
program
  .command("league-roster")
  .argument("<leagueId>", "League ID", parseInt)
  .description("Fetch league roster")
  .option("-l, --include-licenses", "Include licenses")
  .option("-o, --output <path>", "Output path")
  .action(async (leagueId, _, command) => {
    const { credentials, includeLicenses, output } = command.optsWithGlobals();
    const api = createAPI(credentials);

    console.log(`Fetching league roster for ${leagueId}...`);
    const leagueRoster = await api.getLeagueRoster(leagueId, includeLicenses);

    console.log(leagueRoster);
  });

/**
 * league-seasons command
 */
program
  .command("league-seasons")
  .argument("<leagueId>", "League ID", parseInt)
  .description("Fetch league seasons")
  .option("-r, --retired", "Retired")
  .option("-o, --output <path>", "Output path")
  .action(async (leagueId, _, command) => {
    const { credentials, retired, output } = command.optsWithGlobals();
    const api = createAPI(credentials);

    console.log(`Fetching league seasons for ${leagueId}...`);
    const leagueSeasons = await api.getLeagueSeasons(leagueId, retired);

    console.log(leagueSeasons);
  });

/**
 * league-season-standings command
 */
program
  .command("league-season-standings")
  .argument("<leagueId>", "League ID", parseInt)
  .argument("<seasonId>", "Season ID", parseInt)
  .description("Fetch league season standings")
  .option("-c, --car-class-id <carClassId>", "Car class ID", parseInt)
  .option("-C, --car-id <carId>", "Car ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(async (leagueId, seasonId, _, command) => {
    const { credentials, carClassId, carId, output } =
      command.optsWithGlobals();
    const api = createAPI(credentials);

    console.log(
      `Fetching league season standings for ${leagueId} ${seasonId}...`
    );
    const leagueSeasonStandings = await api.getLeagueSeasonStandings(
      leagueId,
      seasonId,
      carClassId,
      carId
    );

    console.log(leagueSeasonStandings);
  });

/**
 * league-sessions command
 */
program
  .command("league-sessions")
  .description("Fetch league sessions")
  .option("-m, --mine", "Mine")
  .option("-p, --package-id <packageId>", "Package ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log("Fetching league sessions...");
    const leagueSessions = await api.getLeagueSessions();
    console.log(leagueSessions);
  });

/**
 * member-awards command
 */
program
  .command("member-awards")
  .argument("[custId]", "Customer ID", parseInt)
  .description("Fetch member awards")
  .option("-o, --output <path>", "Output path")
  .action(async (custId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member awards for ${custId}...`);
    const memberAwards = await api.getMemberAwards(custId);
    console.log(memberAwards);
  });

/**
 * member-career-stats command
 */
program
  .command("member-career-stats")
  .argument("[custId]", "Customer ID", parseInt)
  .description("Fetch member career stats")
  .option("-o, --output <path>", "Output path")
  .action(async (custId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member career stats for ${custId}...`);
    const memberCareerStats = await api.getMemberCareerStats(custId);
    console.log(memberCareerStats);
  });

/**
 * member-info command
 */
program
  .command("member-info")
  .description("Fetch member info")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member info...`);
    const memberInfo = await api.getMemberInfo();
    console.log(memberInfo);
  });

/**
 * member-profile command
 */
program
  .command("member-profile")
  .argument("[custId]", "Customer ID", parseInt)
  .description("Fetch member profile")
  .option("-o, --output <path>", "Output path")
  .action(async (custId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member profile${custId ? ` for ${custId}` : ""}...`);
    const memberProfile = await api.getMemberProfile(custId);
    console.log(memberProfile);
  });

/**
 * race-guide command
 */
program
  .command("race-guide")
  .argument(
    "[from]",
    "ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time."
  )
  .description("Fetch race guide")
  .option(
    "-e, --end-after-from",
    "Include sessions which start before 'from' but end after."
  )
  .option("-o, --output <path>", "Output path")
  .action(async (from, _, command) => {
    const { credentials, endAfterFrom, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(
      `Fetching race guide for ${from}. ${
        endAfterFrom ? "Including" : "Not including"
      } sessions which start before 'from' but end after.`
    );
    const raceGuide = await api.getRaceGuide(from, endAfterFrom);
    console.log(raceGuide);
  });

/**
 * race-results command
 */
program
  .command("race-results")
  .argument("<subsessionId>", "Subsession ID", parseInt)
  .description("Fetch race results for a given session")
  .option("-l, --include-licenses", "Include licenses")
  .option("-o, --output <path>", "Output path")
  .action(async (subsessionId, _, command) => {
    const { credentials, includeLicenses, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching race results for session ${subsessionId}...`);
    const raceResults = await api.getRaceResults(subsessionId, includeLicenses);
    console.log(raceResults);
  });

/**
 * search-drivers command
 */
program
  .command("search-drivers")
  .argument("<search>", "Search query")
  .description("Fetch drivers")
  .option("-l, --league-id <leagueId>", "League ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(async (search, _, command) => {
    const { credentials, output, leagueId } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Searching for drivers matching "${search}"...`);
    const drivers = await api.searchDrivers(search, leagueId);
    console.log(drivers);
  });

/**
 * search-hosted-results command
 */
program
  .command("search-hosted-results")
  .description("Fetch hosted results")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Searching for hosted results matching "undefined"...`);
    console.log("TODO: Add support for params");
    const hostedResults = await api.searchHostedResults({});
    console.log(hostedResults);
  });

/**
 * season-driver-standings command
 */
program
  .command("season-driver-standings")
  .argument("<seasonId>", "Season ID", parseInt)
  .argument("<carClassId>", "Car class ID", parseInt)
  .description("Fetch season driver standings")
  .option("-c, --club-id <clubId>", "Club ID", parseInt)
  .option("-d, --division <division>", "Division", parseInt)
  .option("-r, --race-week-num <raceWeekNum>", "Race week number", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(async (seasonId, carClassId, _, command) => {
    const { credentials, clubId, division, raceWeekNum, output } =
      command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(
      `Fetching season driver standings for ${seasonId} ${carClassId}...`
    );
    const seasonDriverStandings = await api.getSeasonDriverStandings(
      seasonId,
      carClassId,
      clubId,
      division,
      raceWeekNum
    );

    console.log(seasonDriverStandings);
  });

/**
 * season-list command
 */
program
  .command("season-list")
  .argument("<seasonYear>", "Season year", parseInt)
  .argument("<seasonQuarter>", "Season quarter", parseInt)
  .description("Fetch season list")
  .option("-o, --output <path>", "Output path")
  .action(async (seasonYear, seasonQuarter, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log("Fetching season list...");
    const seasonList = await api.getSeasonList(seasonYear, seasonQuarter);
    console.log(seasonList);
  });

/**
 * series command
 */
program
  .command("series")
  .description("Fetch series")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log("Fetching series...");
    const series = await api.getSeries();
    console.log(series);
  });

/**
 * series-past-seasons command
 */
program
  .command("series-past-seasons")
  .argument("<seriesId>", "Series ID", parseInt)
  .description("Fetch series past seasons")
  .option("-o, --output <path>", "Output path")
  .action(async (seriesId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching past seasons for series ${seriesId}...`);
    const seriesPastSeasons = await api.getSeriesPastSeasons(seriesId);
    console.log(seriesPastSeasons);
  });

/**
 * track-assets command
 */
program
  .command("track-assets")
  .description("Fetch track assets")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log("Fetching track assets...");
    const trackAssets = await api.getTrackAssets();
    console.log(trackAssets);
  });

/**
 * track-info command
 */
program
  .command("track-info")
  .description("Fetch track info")
  .option("-o, --output <path>", "Output path")
  .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log("Fetching track info...");
    const trackInfo = await api.getTrackInfo();
    console.log(trackInfo);
  });

program.parse();

//   .command("hosted-combined")
//   .description("Fetch hosted combined sessions")
//   .option("-p, --package-id <packageId>", "Package ID", parseInt)
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("hosted")
//   .description("Fetch hosted sessions")
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("lap-data <subsessionId>")
//   .description("Fetch lap data")
//   .requiredOption("-s, --session-number <sessionNum>", "Session number")
//   .option("-c, --cust-id <custId>", "Customer ID", parseInt)
//   .option("-t, --team-id <teamId>", "Team ID", parseInt)
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("league-directory")
//   .description("Fetch league directory")
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("league-roster")
//   .description("Fetch league roster")
//   .option("-l, --include-licenses", "Include licenses")
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("league-season-standings <leagueId> <seasonId>")
//   .description("Fetch league season standings")
//   .option("-c, --car-class-id <carClassId>", "Car class ID", parseInt)
//   .option("-C, --car-id <carId>", "Car ID", parseInt)
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("league-seasons <leagueId>")
//   .description("Fetch league seasons")
//   .option("-r, --retired", "Retired")
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("league-sessions")
//   .description("Fetch league sessions")
//   .option("-m, --mine", "Mine")
//   .option("-p, --package-id <packageId>", "Package ID", parseInt)
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("lookup-countries")
//   .description("Fetch countries")
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented)

//   .command("lookup-drivers <search>")
//   .description("Fetch drivers")
//   .option("-l, --league-id <leagueId>", "League ID", parseInt)
//   .option("-o, --output <path>", "Output path")
//   .action(notImplemented);

// // TODO: Don't do this... find a nicer way, maybe a single import and pass everything?
// // addCarAssetsCommand(program);
// // addCarCommand(program);
// // addCarClassCommand(program);
// // addCategoriesCommand(program);
// // addDivisionsCommand(program);
// // addEventTypesCommand(program);
// // addHostedCombinedCommand(program);
// // addHostedCommand(program);
// // addLeagueSessionsCommand(program);
// // addLeagueRosterCommand(program);
// // addLeagueSeasonsCommand(program);
// // addLeagueSeasonStandingsCommand(program);
// // addLookupCountriesCommand(program);
// // addLookupDriversCommand(program);
// // addMemberAwardsCommand(program);
// // addMemberInfoCommand(program);
// // addRaceResultsCommand(program);
// // addLapDataCommand(program);
// // addSeasonListCommand(program);
// // addRaceGuideCommand(program);
// // addSeriesCommand(program);
// // addSeriesPastSeasonsCommand(program);
// // addMemberCareerStatsCommand(program);
// // addSeasonDriverStandingsCommand(program);
// // addTrackAssetsCommand(program);
// // addTrackInfoCommand(program);
