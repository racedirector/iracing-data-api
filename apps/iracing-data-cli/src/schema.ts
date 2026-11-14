import { Command, type CommandUnknownOpts } from "@commander-js/extra-typings";
import { z } from "zod";

const globalOptionsShape = z.object({
  accessToken: z.string().optional(),
  credentials: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  redirectUri: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

/** Parse a Commander invocation into shared options with nearest-command precedence. */
export const GlobalOptionsSchema = z.preprocess(
  commandOptions,
  globalOptionsShape,
);

/** Parse only API credential selection, excluding OAuth account inputs. */
const CredentialOptionsSchema = z.preprocess(
  commandOptions,
  globalOptionsShape.pick({ accessToken: true, credentials: true }),
);

/**
 * Read shared inputs with nearest-command overrides (Commander itself gives globals priority).
 * @param {Command} command - Executing leaf command.
 * @returns {z.output<typeof GlobalOptionsSchema>} Parsed shared options, excluding unrelated inputs.
 */
export function readGlobalOptions(command: Command) {
  return GlobalOptionsSchema.parse(command);
}

/**
 * Read bearer/file selection without forwarding OAuth account secrets to API commands.
 * @param {Command} command - Executing command with optional local overrides.
 * @returns {{accessToken?: string, credentials?: string}} Selected API credentials.
 */
export function readCredentialOptions(command: Command) {
  return CredentialOptionsSchema.parse(command);
}

/**
 * Extract command options ancestor-first so local values override shared defaults.
 * Non-command inputs pass through for the object schema to validate.
 * @param {unknown} input - Commander invocation to preprocess.
 * @returns {unknown} Extracted options or the original non-command input.
 */
function commandOptions(input: unknown): unknown {
  if (!(input instanceof Command)) {
    return input;
  }

  const ancestors: CommandUnknownOpts[] = [];

  for (
    let current: CommandUnknownOpts | null = input;
    current;
    current = current.parent
  ) {
    ancestors.unshift(current);
  }

  return Object.assign(
    {},
    ...ancestors.map((ancestor) => ancestor.opts()),
  ) as Record<string, unknown>;
}
