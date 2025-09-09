export class IRacingAuthenticationError extends Error {
  constructor() {
    super("Failed to authenticate with iRacing.");
  }
}

export class InvalidResponseData extends Error {
  constructor() {
    super("Invalid response data");
  }
}

export class InvalidSessionError extends Error {
  constructor() {
    super("You are not authenticated. Please run `auth`.");
  }
}

export class CacheExpiredError extends Error {
  constructor() {
    super("Cached data has expired");
  }
}
