Usage: index [options] [command]

CLI tool for interacting with the iRacing API

Options:
  -V, --version                                            output the version number
  -c, --credentials <path>                                 Path to credentials file
  -h, --help                                               display help for command

Commands:
  whoami                                                   Prints the current session's username
  auth [options]                                           Stores credentials for the iRacing API
  logout                                                   Clears stored credentials
  docs [options]                                           Downloads the latest API documentation from `/data/doc`
  car-assets                                               Fetch car assets
  car                                                      Fetch car
  car-class [options]                                      Fetch car class
  categories [options]                                     Fetch categories
  divisions [options]                                      Fetch divisions
  event-types [options]                                    Fetch event types
  member-profile [options]                                 Fetch member profile
  driver-stats [options] <category>                        Fetch driver stats for a specific category
  hosted-combined [options]                                Fetch hosted combined sessions
  hosted [options]                                         Fetch hosted sessions
  league [options] <leagueId>                              Fetch league
  league-sessions [options]                                Fetch league sessions
  league-directory [options]                               Fetch league directory
  league-membership [options]                              Fetch league membership
  league-roster [options]                                  Fetch league roster
  league-seasons [options] <leagueId>                      Fetch league seasons
  league-season-standings [options] <leagueId> <seasonId>  Fetch league season standings
  lookup-countries [options]                               Fetch countries
  lookup-drivers [options] <search>                        Fetch drivers
  member-awards [options]                                  Fetch member awards
  member-info [options]                                    Fetch member info
  race-results [options] <subsessionId>                    Get results for a subsession.
  lap-data [options] <subsessionId> <simsessionNumber>     Fetch lap data
  season-list [options] <seasonYear> <seasonQuarter>       Fetch season list
  race-guide [options]                                     Fetch race guid
  series [options]                                         Fetch series
  series-past-seasons <seriesId>                           Fetch series past seasons
  member-career-stats [options]                            Fetch member career stats
  season-driver-standings [options]                        Fetch season driver standings
  track-assets                                             Fetch track assets
  track-info                                               Fetch track info
  help [command]                                           display help for command
