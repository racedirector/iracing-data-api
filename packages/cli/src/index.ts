#!/usr/bin/env node
import path from "path";
import { Command } from "commander";
import { CookieJar } from "tough-cookie";
import IRacingAPI from "@iracing-data/api";
import { addAuthCommand } from "./commands/auth";
import { addDocsCommand } from "./commands/docs";
import { addMemberProfileCommand } from "./commands/member-profile";
import { addDriverStatsCommand } from "./commands/driver-stats";
import { addLeagueCommand } from "./commands/league";
import { addLeagueMembershipCommand } from "./commands/league-membership";
import { addWhoamiCommand } from "./commands/whoami";
import { JSONCookieStore } from "./storage";
import { addLogoutCommand } from "./commands/logout";
import { addCarAssetsCommand } from "./commands/car-assets";
import { addCarCommand } from "./commands/car";
import { addCarClassCommand } from "./commands/car-class";
import { addCategoriesCommand } from "./commands/categories";
import { addDivisionsCommand } from "./commands/divisions";
import { addEventTypesCommand } from "./commands/event-types";
import { addHostedCombinedCommand } from "./commands/hosted-combined";
import { addHostedCommand } from "./commands/hosted";
import { addLeagueSessionsCommand } from "./commands/league-sessions";
import { addLeagueRosterCommand } from "./commands/league-roster";
import { addLeagueSeasonsCommand } from "./commands/league-seasons";
import { addLeagueSeasonStandingsCommand } from "./commands/league-season-standings";
import { addLookupCountriesCommand } from "./commands/lookup-countries";
import { addLookupDriversCommand } from "./commands/lookup-drivers";
import { addTrackInfoCommand } from "./commands/track-info";
import { addTrackAssetsCommand } from "./commands/track-assets";
import { addSeasonDriverStandingsCommand } from "./commands/season-driver-standings";
import { addMemberCareerStatsCommand } from "./commands/member-career-stats";
import { addSeriesPastSeasonsCommand } from "./commands/series-past-seasons";
import { addSeriesCommand } from "./commands/series";
import { addRaceGuideCommand } from "./commands/race-guide";
import { addSeasonListCommand } from "./commands/season-list";
import { addLapDataCommand } from "./commands/lap-data";
import { addRaceResultsCommand } from "./commands/race-results";
import { addMemberInfoCommand } from "./commands/member-info";
import { addMemberAwardsCommand } from "./commands/member-awards";

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

// TODO: Don't do this... find a nicer way, maybe a single import and pass everything?
addWhoamiCommand(program, cookieStore);
addLogoutCommand(program, cookieStore);
addAuthCommand(program, api);
addDocsCommand(program, api);
addCarAssetsCommand(program);
addCarCommand(program);
addCarClassCommand(program);
addCategoriesCommand(program);
addDivisionsCommand(program);
addEventTypesCommand(program);
addMemberProfileCommand(program, api);
addDriverStatsCommand(program, api);
addHostedCombinedCommand(program);
addHostedCommand(program);
addLeagueCommand(program, api);
addLeagueSessionsCommand(program);
addLeagueMembershipCommand(program, api);
addLeagueRosterCommand(program);
addLeagueSeasonsCommand(program);
addLeagueSeasonStandingsCommand(program);
addLookupCountriesCommand(program);
addLookupDriversCommand(program);
addMemberAwardsCommand(program);
addMemberInfoCommand(program);
addRaceResultsCommand(program);
addLapDataCommand(program);
addSeasonListCommand(program);
addRaceGuideCommand(program);
addSeriesCommand(program);
addSeriesPastSeasonsCommand(program);
addMemberCareerStatsCommand(program);
addSeasonDriverStandingsCommand(program);
addTrackAssetsCommand(program);
addTrackInfoCommand(program);

program.parse(process.argv);
