import { Config } from "./config";
import { IRacing } from "./iracing";

export class AppContext {
  constructor(
    private options: {
      config: Config;
      iRacing: IRacing;
    }
  ) {}

  get config() {
    return this.options.config;
  }

  get iRacing() {
    return this.options.iRacing;
  }
}

export default AppContext;
