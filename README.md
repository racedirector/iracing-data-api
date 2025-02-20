# iracing-data-api

Axios API implementation and cli for the `/data` API on iRacing

## Installation

_Coming Soon_

### API
```bash
yarn add @iracing-data/api
```

### CLI
```bash
yarn dlx @iracing-data/cli [command]
```

## Usage

### API

```javascript
import IRacingAPI from '@iracing-data/api';

// In-memory cookie storage
const api = new IRacingAPI()

// BYO cookie storage (see CLI for details)
import { CookieJar } from 'tough-cookie';
import { CustomStore } from './custom-cookie-store';

const cookieJar = new CookieJar(new CustomStore())
const api = new IRacingAPI(cookieJar)

// Use as-needed
await api.authenticate('username', 'password');
```

### CLI

```bash
$ iracing-data --help

Usage: index [options] [command]

CLI tool for interacting with the iRacing API

Options:
  -V, --version                                              output the version number
  --credentials <path>                                       Path to credentials file (default:
                                                             "./cookies.json")
  -h, --help                                                 display help for command

Commands:
  whoami                                                     Prints the current session information.
  logout                                                     Logs out of the current session.
  auth [options]                                             Stores credentials for the iRacing API
  award-instances [options] <custId> <awardId>               Fetch award instances
  car-assets [options]                                       Fetch car assets
  car [options]                                              Fetch car
  car-class [options]                                        Fetch car class
  categories [options]                                       Fetch categories
  club-history [options] <seasonYear> <seasonQuarter>        Fetch club history
  countries [options]                                        Fetch countries
  divisions [options]                                        Fetch divisions
  docs [options]                                             Downloads the latest API documentation from `/data/doc`
  driver-stats [options] <category>                          Fetch driver stats
  event-types [options]                                      Fetch event types
  hosted [options]                                           Fetch hosted sessions
  hosted-combined [options]                                  Fetch hosted combined sessions
  lap-data [options] <subsessionId> <sessionNum>             Fetch lap data
  league [options] <leagueId>                                Fetch league
  league-directory [options]                                 Fetch league directory
  league-membership [options] [custId]                       Fetch league membership
  league-points-systems [options] <leagueId>                 Fetch league points systems
  league-roster [options] <leagueId>                         Fetch league roster
  league-seasons [options] <leagueId>                        Fetch league seasons
  league-season-sessions [options] <leagueId> <seasonId>     Fetch league season sessions
  league-season-standings [options] <leagueId> <seasonId>    Fetch league season standings
  league-sessions [options]                                  Fetch league sessions
  licenses [options]                                         Fetch licenses
  member-awards [options] [custId]                           Fetch member awards
  member-career-stats [options] [custId]                     Fetch member career stats
  member-info [options]                                      Fetch member info
  member-profile [options] [custId]                          Fetch member profile
  race-guide [options] [from]                                Fetch race guide
  race-results [options] <subsessionId>                      Fetch race results for a given session
  search-drivers [options] <search>                          Fetch drivers
  search-hosted-results [options]                            Fetch hosted results
  season-driver-standings [options] <seasonId> <carClassId>  Fetch season driver standings
  season-list [options] <seasonYear> <seasonQuarter>         Fetch season list
  series [options]                                           Fetch series
  series-past-seasons [options] <seriesId>                   Fetch series past seasons
  track-assets [options]                                     Fetch track assets
  track-info [options]                                       Fetch track info
  help [command]                                             display help for command
```

## TODO

- [x] Implement all endpoints
- [x] Convert function parameters to objects to better handle optional parameters
- [x] Add publish to npm github workflow
- [ ] Establish nicer patterns for adding commands.
