import IRacingAPI from "@iracing-data/api";
import path from "node:path";
import { Command, OptionValues } from "commander";
import { Store, CookieJar } from "tough-cookie";
import { JSONCookieStore } from "./storage";

/**
 * Subcommand class that provides a common interface for subcommands;
 * provides a cookie store and an API instance.
 */
export class IRacingDataSubcommand extends Command {
  private _api: IRacingAPI;

  constructor(api: IRacingAPI, name?: string) {
    super(name);
    this._api = api;
  }

  get api(): IRacingAPI {
    return this._api;
  }

  get cookieStore(): Store {
    return this._api.cookieJar.store;
  }

  createCommand(name?: string): IRacingDataSubcommand {
    return new IRacingDataSubcommand(this.api, name);
  }
}

/**
 * Main command class that provides a common interface for the CLI tool;
 * provides a cookie store and an API instance to subcommands.
 */
export class IRacingDataCommand extends Command {
  private _cookieStore?: Store;
  private _api?: IRacingAPI;

  constructor() {
    super("iracing-data");
    this.description("CLI tool for interacting with the iRacing API");
    this.version("0.0.0");
    this.option(
      "-c, --credentials [path]",
      "Path to credentials file",
      path.join(__dirname, "cookies.json")
    );
  }

  get cookieStore(): Store {
    if (!this._cookieStore) {
      const options = this.optsWithGlobals();
      console.log("Creating cookie store:", options);
      this._cookieStore = new JSONCookieStore(options.credentials);
    }

    return this._cookieStore;
  }

  get api(): IRacingAPI {
    if (!this._api) {
      this._api = new IRacingAPI(new CookieJar(this.cookieStore));
    }

    return this._api;
  }

  createCommand(name?: string): IRacingDataSubcommand {
    return new IRacingDataSubcommand(this.api, name);
  }
}

export class IRacingCommand extends Command {
  private _api: IRacingAPI;

  constructor(api: IRacingAPI, name?: string) {
    super(name);
    this._api = api;
  }

  get api(): IRacingAPI {
    return this._api;
  }

  createCommand(name?: string): IRacingCommand {
    return new IRacingCommand(this.api, name);
  }
}

export class RootCommand extends Command {
  private _api?: IRacingAPI;

  constructor(name?: string) {
    super(name);
    this.option(
      "-c, --credentials [path]",
      "Path to credentials file",
      path.join(__dirname, "cookies.json")
    );
  }

  get api(): IRacingAPI {
    if (!this._api) {
      const { credentials } = this.optsWithGlobals();
      console.log("Creating API instance", credentials);
      const cookieStore = new JSONCookieStore(credentials);
      this._api = new IRacingAPI(new CookieJar(cookieStore));
    }

    return this._api;
  }

  /**
   * Creates a new command with access to the iRacing API
   * with the provided credentials, if any.
   */
  createCommand(name?: string): IRacingCommand {
    return new IRacingCommand(this.api, name);
  }
}
