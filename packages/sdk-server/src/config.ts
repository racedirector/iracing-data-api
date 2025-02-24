import assert from "node:assert";

export interface ConfigOptions {
  /**
   * The port to run the server on
   * @default 3000
   */
  port: number;
}

export class Config {
  private assignedPort?: number;

  constructor(private options: ConfigOptions) {}

  public static readEnvironment(overrides: Partial<ConfigOptions>) {
    const port = parseInt(process.env.PORT || "3000", 10);

    return new Config({
      port,
      ...overrides,
    });
  }

  public get isDev(): boolean {
    return process.env.NODE_ENV === "development";
  }

  assignPort(port: number) {
    assert(
      !this.options.port || this.options.port === port,
      "Conflicting port in config"
    );

    this.assignedPort = port;
  }

  public get port(): number {
    return this.assignedPort || this.options.port;
  }
}

export default Config;
