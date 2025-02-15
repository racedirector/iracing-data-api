#!/usr/bin/env node
import path from "path";
import { Command } from "commander";
import { CookieJar } from "tough-cookie";
import IRacingAPI from "@iracing-data/api";
import authCommand from "./commands/auth";
import docsCommand from "./commands/docs";
import memberProfileCommand from "./commands/member-profile";
import driverStatsCommand from "./commands/driver-stats";
import leagueCommand from "./commands/league";
import leagueMembershipCommand from "./commands/league-membership";
import notImplementedCommand from "./commands/not-implemented";
import whoamiCommand from "./commands/whoami";
import { JSONCookieStore } from "./storage";

// TODO: Create all of this stuff on command execution
const cookieJarPath = path.join(__dirname, "cookies.json");
const cookieStore = new JSONCookieStore(cookieJarPath);
const api = new IRacingAPI(undefined, new CookieJar(cookieStore));

const program = new Command();

program
  .version("0.0.0")
  .description("CLI tool for interacting with the iRacing API")
  // TODO: Find some way to set the cookie store to the credentials file
  .option("-c, --credentials <path>", "Path to credentials file");

program
  .command("whoami")
  .description("Prints the current session's username")
  .action(whoamiCommand(cookieStore));

program
  .command("auth")
  .description("Stores credentials for the iRacing API")
  .option("-u, --username <username>", "iRacing username")
  .action(authCommand(api));

program
  .command("logout")
  .description("Clears stored credentials")
  .action(async () => {
    cookieStore.removeAllCookies();
  });

program
  .command("docs")
  .description("Downloads the latest API documentation from `/data/doc`")
  .option("-o, --output <path>", "Output path")
  .action(docsCommand(api));

program
  .command("car-assets")
  .description("Fetch car assets")
  .action(notImplementedCommand);

program.command("car").description("Fetch car").action(notImplementedCommand);

program
  .command("car-class")
  .description("Fetch car class")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("categories")
  .description("Fetch categories")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("divisions")
  .description("Fetch divisions")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("event-types")
  .description("Fetch event types")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("member-profile")
  .description("Fetch member profile")
  .option("-c, --cust-id <custId>", "Customer ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(memberProfileCommand(api));

program
  .command("driver-stats <category>")
  .description("Fetch driver stats for a specific category")
  .option("-o, --output <path>", "Output path")
  .action(driverStatsCommand(api));

program
  .command("hosted-combined")
  .description("Fetch hosted combined sessions")
  .option("-p, --package-id <packageId>", "Package ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("hosted")
  .description("Fetch hosted sessions")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("league <leagueId>")
  .description("Fetch league")
  .option("-l, --include-licenses", "Include licenses")
  .option("-o, --output <path>", "Output path")
  .action(leagueCommand(api));

program
  .command("league-sessions")
  .description("Fetch league sessions")
  .option("-m, --mine", "Mine")
  .option("-p, --package-id <packageId>", "Package ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("league-directory")
  .description("Fetch league directory")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("league-membership")
  .description("Fetch league membership")
  .option("-c, --cust-id <custId>", "Customer ID", parseInt)
  .option("-l, --include-league", "Include league")
  .option("-o, --output <path>", "Output path")
  .action(leagueMembershipCommand(api));

program
  .command("league-roster")
  .description("Fetch league roster")
  .option("-l, --include-licenses", "Include licenses")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("league-seasons <leagueId>")
  .description("Fetch league seasons")
  .option("-r, --retired", "Retired")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("league-season-standings <leagueId> <seasonId>")
  .description("Fetch league season standings")
  .option("-c, --car-class-id <carClassId>", "Car class ID", parseInt)
  .option("-C, --car-id <carId>", "Car ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("lookup-countries")
  .description("Fetch countries")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("lookup-drivers <search>")
  .description("Fetch drivers")
  .option("-l, --league-id <leagueId>", "League ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("member-awards")
  .description("Fetch member awards")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("member-info")
  .description("Fetch member info")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("race-results <subsessionId>")
  .description("Get results for a subsession.")
  .option("-l, --include-licenses", "Include licenses")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("lap-data <subsessionId> <simsessionNumber>")
  .description("Fetch lap data")
  .option("-c, --cust-id <custId>", "Customer ID", parseInt)
  .option("-t, --team-id <teamId>", "Team ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("season-list <seasonYear> <seasonQuarter>")
  .description("Fetch season list")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("race-guide")
  .description("Fetch race guid")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("series")
  .description("Fetch series")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("series-past-seasons <seriesId>")
  .description("Fetch series past seasons")
  .action(notImplementedCommand);

program
  .command("member-career-stats")
  .description("Fetch member career stats")
  .option("-c, --cust-id <custId>", "Customer ID", parseInt)
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("season-driver-standings")
  .description("Fetch season driver standings")
  .requiredOption("-s, --season-id <seasonId>", "Season ID")
  .requiredOption("-c, --car-class-id <carClassId>", "Car class ID")
  .option("-C, --club-id <clubId>", "Club ID", parseInt)
  .option("-d, --division <division>", "Division")
  .option("-w, --race-week-num <raceWeekNum>", "Race week number")
  .option("-o, --output <path>", "Output path")
  .action(notImplementedCommand);

program
  .command("track-assets")
  .description("Fetch track assets")
  .action(notImplementedCommand);

program
  .command("track-info")
  .description("Fetch track info")
  .action(notImplementedCommand);

program.parse(process.argv);
