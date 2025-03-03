#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const extra_typings_1 = require("@commander-js/extra-typings");
const api_1 = require("@iracing-data/api");
const download_car_assets_1 = require("@iracing-data/download-car-assets");
const download_track_assets_1 = require("@iracing-data/download-track-assets");
const sdk_dump_1 = require("@iracing-data/sdk-dump");
const inquirer_1 = __importDefault(require("inquirer"));
const lodash_1 = require("lodash");
const tough_cookie_1 = require("tough-cookie");
const storage_1 = require("./storage");
const util_1 = require("./util");
const createCookieStore = (credentials) => {
    return new storage_1.JSONCookieStore(credentials);
};
const createCookieJar = (credentials) => {
    return new tough_cookie_1.CookieJar(createCookieStore(credentials));
};
const createAPI = (credentials) => {
    return new api_1.IRacingAPISessionClient(createCookieJar(credentials));
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
    // ???: Should this remain a global option or be attached to relevant commands via Command subclass?
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
    const hashedPassword = await (0, api_1.hashPassword)(username, password);
    const api = createAPI(credentials);
    await api.authenticate({ username, password: hashedPassword });
    console.log("✅ Authentication successful");
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
    (0, util_1.handleOutput)(awardInstances, output);
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
    (0, util_1.handleOutput)(carAssets, output);
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
    (0, util_1.handleOutput)(car, output);
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
    (0, util_1.handleOutput)(carClass, output);
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
    (0, util_1.handleOutput)(categories, output);
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
    (0, util_1.handleOutput)(clubHistory, output);
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
    (0, util_1.handleOutput)(countries, output);
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
    (0, util_1.handleOutput)(divisions, output);
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
    (0, util_1.handleOutput)(docs, output);
});
program
    .command("download-car-assets")
    .description("Downloads the latest car assets.")
    .requiredOption("-o, --out-dir <path>", "Output directory")
    .option("-i, --write-full-info", "Write full car info", false)
    .option("--skip-info", "Skip writing car info", false)
    .option("-a, --write-full-assets", "Write full car assets", false)
    .option("--skip-assets", "Skip writing car asset", false)
    .option("-u, --username <username>", "iRacing username")
    .action(async (_, command) => {
    console.log("Downloading car assets...");
    const { credentials, outDir, writeFullAssets, writeFullInfo, skipInfo: skipCarInfo, skipAssets: skipCarAssets, username, } = command.optsWithGlobals();
    const api = createAPI(credentials);
    await (0, download_car_assets_1.downloadCarAssets)({
        outputDir: outDir,
        writeFullAssets,
        writeFullInfo,
        skipCarAssets,
        skipCarInfo,
        username,
    }, api);
    console.log("Done!");
});
program
    .command("download-track-assets")
    .description("Downloads the latest track SVGs.")
    .requiredOption("-o, --out-dir <path>", "Output directory")
    .option("-f, --force", "Force download of existing SVG layers", false)
    .option("-i, --write-full-info", "Write full track info", false)
    .option("--skip-info", "Skip writing track info", false)
    .option("-a, --write-full-assets", "Write full track assets", false)
    .option("--skip-assets", "Skip writing track asset", false)
    .option("--include-svgs", "Include SVGs", false)
    .action(async (_, command) => {
    console.log("Downloading track assets...");
    const { credentials, outDir, writeFullAssets, writeFullInfo, skipAssets: skipTrackAssets, skipInfo: skipTrackInfo, includeSvgs, force, } = command.optsWithGlobals();
    console.log("include svgs:", includeSvgs);
    const api = createAPI(credentials);
    await (0, download_track_assets_1.downloadTrackAssets)({
        outputDir: outDir,
        writeFullAssets,
        writeFullInfo,
        skipTrackAssets,
        skipTrackInfo,
        force,
        includeSVGs: includeSvgs,
    }, api);
    console.log("Done!");
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
    (0, util_1.handleOutput)(driverStats, output);
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
    (0, util_1.handleOutput)(eventTypes, output);
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
    (0, util_1.handleOutput)(hostedSessions, output);
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
    (0, util_1.handleOutput)(hostedCombinedSessions, output);
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
    (0, util_1.handleOutput)(lapData, output);
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
    (0, util_1.handleOutput)(league, output);
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
    (0, util_1.handleOutput)(leagueDirectory, output);
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
    (0, util_1.handleOutput)(leagueMembership, output);
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
    (0, util_1.handleOutput)(leaguePointsSystems, output);
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
    (0, util_1.handleOutput)(leagueRoster, output);
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
    (0, util_1.handleOutput)(leagueSeasons, output);
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
    (0, util_1.handleOutput)(leagueSeasonSessions, output);
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
    (0, util_1.handleOutput)(leagueSeasonStandings, output);
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
    (0, util_1.handleOutput)(leagueSessions, output);
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
    (0, util_1.handleOutput)(licenses, output);
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
    (0, util_1.handleOutput)(memberAwards, output);
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
    (0, util_1.handleOutput)(memberCareerStats, output);
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
    (0, util_1.handleOutput)(memberInfo, output);
});
/**
 * member-participation command
 */
program
    .command("member-participation")
    .description("Fetch member info")
    .option("-o, --output <path>", "Output path")
    .action(async (_, command) => {
    const { credentials, output } = command.optsWithGlobals();
    const api = createAPI(credentials);
    console.log(`Fetching member participation...`);
    const participation = await api.memberParticipationCredits();
    (0, util_1.handleOutput)(participation, output);
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
    (0, util_1.handleOutput)(memberProfile, output);
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
    const { endAfterFrom } = command.optsWithGlobals();
    // const api = createAPI(credentials);
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
    (0, util_1.handleOutput)(raceResults, output);
});
program
    .command("sdk-dump")
    .description("Dump the SDK to the output directory.")
    .requiredOption("-o, --output <path>", "Output path")
    .option("--format <format>", "Format of the output", "json")
    .action(async (_, command) => {
    const { output, format } = command.optsWithGlobals();
    (0, sdk_dump_1.assertDumpFormat)(format);
    await (0, sdk_dump_1.sdkDump)({
        format,
        outputDir: output,
    });
    console.log("SDK data dumped to", output);
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
    (0, util_1.handleOutput)(drivers, output);
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
    (0, util_1.handleOutput)(hostedResults, output);
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
    (0, util_1.handleOutput)(seasonDriverStandings, output);
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
    (0, util_1.handleOutput)(seasonList, output);
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
    (0, util_1.handleOutput)(series, output);
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
    (0, util_1.handleOutput)(seriesPastSeasons, output);
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
    (0, util_1.handleOutput)(trackAssets, output);
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
    (0, util_1.handleOutput)(trackInfo, output);
});
program.parse();
