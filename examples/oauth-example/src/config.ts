export const PORT = process.env.PORT || "3000";
export const IRACING_CLIENT_ID = process.env.IRACING_AUTH_CLIENT!;

export const IRACING_AUTH_SECRET = process.env.IRACING_AUTH_SECRET;

export const IRACING_AUTH_USERNAME = process.env.IRACING_AUTH_USERNAME;
export const IRACING_AUTH_PASSWORD = process.env.IRACING_AUTH_PASSWORD;

/**
 * Password limited flow is enabled if a secret, username, and password is provided.
 */
export const isPasswordLimitedEnabled =
  !!IRACING_AUTH_SECRET && !!IRACING_AUTH_USERNAME && !!IRACING_AUTH_PASSWORD;
