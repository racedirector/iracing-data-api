#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const extra_typings_1 = require("@commander-js/extra-typings");
const lodash_1 = require("lodash");
const tough_cookie_1 = require("tough-cookie");
const api_1 = __importStar(require("@iracing-data/api"));
const storage_1 = require("./storage");
const util_1 = require("./util");
const createCookieStore = (credentials) => {
    return new storage_1.JSONCookieStore(credentials);
};
const createCookieJar = (credentials) => {
    return new tough_cookie_1.CookieJar(createCookieStore(credentials));
};
const createAPI = (credentials) => {
    return new api_1.default(createCookieJar(credentials));
};
const categoryArg = new extra_typings_1.Argument("<category>", "Category to fetch driver stats for")
    .choices(api_1.CATEGORY_VALUES)
    .argRequired();
/**
 * Main program instance that provides a common interface for the CLI tool.
 */
const program = new extra_typings_1.Command("iracing-data")
    .description("CLI tool for interacting with the iRacing API")
    .version("0.0.0")
    .option("--credentials <path>", "Path to credentials file", path_1.default.join(__dirname, "cookies.json"));
/**
 * whoami command
 */
program
    .command("whoami")
    .description("Prints the current session information.")
    .action((_, command) => {
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
    cookieJar.removeAllCookies(lodash_1.noop);
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
    const { username = usernameOption, password } = await inquirer_1.default.prompt([
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
    const hashedPassword = await (0, util_1.hashPassword)(username, password);
    const api = createAPI(credentials);
    await api.authenticate({ username, password: hashedPassword });
});
/**
 * award-instances command
 */
program
    .command("award-instances")
    .argument("[customerId]", "Customer ID", parseInt)
    .argument("<awardId>", "Award ID", parseInt)
    .description("Fetch award instances")
    .option("-o, --output <path>", "Output path")
    .action(async (customerId, awardId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const awardInstances = await api.memberAwardInstances({
        customerId,
        awardId,
    });
    console.log(awardInstances);
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
    const carAssets = await api.carAssets();
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
    const car = await api.carGet();
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
    const carClass = await api.carClassGet();
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
    const categories = await api.constantsCategories();
    console.log(categories);
});
/**
 * club-history command
 */
program
    .command("club-history")
    .argument("<seasonYear>", "Season year", parseInt)
    .argument("<seasonQuarter>", "Season quarter", parseInt)
    .description("Fetch club history")
    .option("-o, --output <path>", "Output path")
    .action(async (seasonYear, seasonQuarter, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching club history for ${seasonYear} ${seasonQuarter}...`);
    const clubHistory = await api.lookupClubHistory({
        seasonYear,
        seasonQuarter,
    });
    console.log(clubHistory);
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
    const countries = await api.lookupCountries();
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
    const divisions = await api.constantsDivisions();
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
    const docs = await api.doc();
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
    (0, api_1.assertCategory)(category);
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const driverStats = await api.driverStatsByCategory({ category });
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
    const eventTypes = await api.constantsEventTypes();
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
    const hostedSessions = await api.hostedSessions();
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
    const hostedCombinedSessions = await api.hostedCombinedSessions({
        packageId,
    });
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
    .option("-c, --customer-id <customerId>", "Customer ID", parseInt)
    .option("-t, --team-id <teamId>", "Team ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(async (subsessionId, sessionNumber, _, command) => {
    const { credentials, customerId, teamId, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const lapData = await api.resultsLapData({
        subsessionId,
        simsessionNumber: sessionNumber,
        customerId,
        teamId,
    });
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
    const league = await api.leagueGet({ leagueId, includeLicenses });
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
    const leagueDirectory = await api.leagueDirectory();
    console.log(leagueDirectory);
});
/**
 * league-membership command
 */
program
    .command("league-membership")
    .argument("[customerId]", "Customer ID", parseInt)
    .description("Fetch league membership")
    .option("-l, --include-league", "Include league")
    .option("-o, --output <path>", "Output path")
    .action(async (customerId, _, command) => {
    const { credentials, includeLeague, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching league membership for ${customerId}...`);
    const leagueMembership = await api.leagueMembership({
        customerId,
        includeLeague,
    });
    console.log(leagueMembership);
});
/**
 * league-points-systems command
 */
program
    .command("league-points-systems")
    .argument("<leagueId>", "League ID", parseInt)
    .description("Fetch league points systems")
    .option("-s, --season-id <seasonId>", "Season ID", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(async (leagueId, _, command) => {
    const { credentials, output, seasonId } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log("Fetching league points systems...");
    const leaguePointsSystems = await api.leagueGetPointsSystems({
        leagueId,
        seasonId,
    });
    console.log(leaguePointsSystems);
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
    const leagueRoster = await api.leagueRoster({
        leagueId,
        includeLicenses,
    });
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
    const leagueSeasons = await api.leagueSeasons({ leagueId, retired });
    console.log(leagueSeasons);
});
/**
 * league-season-sessions command
 */
program
    .command("league-season-sessions")
    .argument("<leagueId>", "League ID", parseInt)
    .argument("<seasonId>", "Season ID", parseInt)
    .description("Fetch league season sessions")
    .option("-r, --results-only", "Results only")
    .option("-o, --output <path>", "Output path")
    .action(async (leagueId, seasonId, _, command) => {
    const { credentials, output, resultsOnly } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching league season sessions for ${leagueId} ${seasonId}...`);
    const leagueSeasonSessions = await api.leagueSeasonSessions({
        leagueId,
        seasonId,
        resultsOnly,
    });
    console.log(leagueSeasonSessions);
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
    const { credentials, carClassId, carId, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching league season standings for ${leagueId} ${seasonId}...`);
    const leagueSeasonStandings = await api.leagueSeasonStandings({
        leagueId,
        seasonId,
        carClassId,
        carId,
    });
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
    const leagueSessions = await api.leagueCustomerLeagueSessions();
    console.log(leagueSessions);
});
/**
 * licenses command
 */
program
    .command("licenses")
    .description("Fetch licenses")
    .option("-o, --output <path>", "Output path")
    .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    const licenses = await api.lookupLicenses();
    console.log(licenses);
});
/**
 * member-awards command
 */
program
    .command("member-awards")
    .argument("[customerId]", "Customer ID", parseInt)
    .description("Fetch member awards")
    .option("-o, --output <path>", "Output path")
    .action(async (customerId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member awards for ${customerId}...`);
    const memberAwards = await api.memberAwards({ customerId });
    console.log(memberAwards);
});
/**
 * member-career-stats command
 */
program
    .command("member-career-stats")
    .argument("[customerId]", "Customer ID", parseInt)
    .description("Fetch member career stats")
    .option("-o, --output <path>", "Output path")
    .action(async (customerId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member career stats for ${customerId}...`);
    const memberCareerStats = await api.statsMemberCareer({ customerId });
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
    const memberInfo = await api.memberInfo();
    console.log(memberInfo);
});
/**
 * member-profile command
 */
program
    .command("member-profile")
    .argument("[customerId]", "Customer ID", parseInt)
    .description("Fetch member profile")
    .option("-o, --output <path>", "Output path")
    .action(async (customerId, _, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member profile${customerId ? ` for ${customerId}` : ""}...`);
    const memberProfile = await api.memberProfile({ customerId });
    console.log(memberProfile);
});
/**
 * race-guide command
 */
program
    .command("race-guide")
    .argument("[from]", "ISO-8601 offset format. Defaults to the current time. Include sessions with start times up to 3 hours after this time. Times in the past will be rewritten to the current time.")
    .description("Fetch race guide")
    .option("-e, --end-after-from", "Include sessions which start before 'from' but end after.")
    .option("-o, --output <path>", "Output path")
    .action(async (from, _, command) => {
    const { credentials, endAfterFrom, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching race guide for ${from}. ${endAfterFrom ? "Including" : "Not including"} sessions which start before 'from' but end after.`);
    console.error("!!!: Fix this");
    // const raceGuide = await api.getRaceGuide({
    //   from: from ? Date.parse(from) : undefined,
    //   endAfterFrom,
    // });
    // console.log(raceGuide);
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
    const raceResults = await api.resultsGet({
        subsessionId,
        includeLicenses,
    });
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
    const drivers = await api.lookupDrivers({ searchTerm: search, leagueId });
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
    const hostedResults = await api.resultsSearchHosted();
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
    .option("-r, --race-week-number <raceWeekNum>", "Race week number", parseInt)
    .option("-o, --output <path>", "Output path")
    .action(async (seasonId, carClassId, _, command) => {
    const { credentials, clubId, division, raceWeekNumber, output } = command.optsWithGlobals();
    (0, api_1.assertDivision)(division);
    const api = createAPI(credentials);
    console.log(`Fetching season driver standings for ${seasonId} ${carClassId}...`);
    const seasonDriverStandings = await api.statsSeasonDriverStandings({
        seasonId,
        carClassId,
        clubId,
        division,
        raceWeekNumber,
    });
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
    const seasonList = await api.seasonList({ seasonYear, seasonQuarter });
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
    const series = await api.seriesGet();
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
    const seriesPastSeasons = await api.seriesPastSeasons({ seriesId });
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
    const trackAssets = await api.trackAssets();
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
    const trackInfo = await api.trackGet();
    console.log(trackInfo);
});
program.parse();
