import { Command } from "commander";
import assert from "node:assert";
import { Store } from "tough-cookie";

export const addWhoamiCommand = (program: Command, cookieStore: Store) =>
  program
    .command("whoami")
    .description("Prints the current session's username")
    .action(whoami(cookieStore));

export const whoami = (cookieStore: Store) => async () => {
  const authTokenCookie = await cookieStore.findCookie(
    "iracing.com",
    "/",
    "authtoken_members"
  );

  assert(authTokenCookie, "No auth token found");

  const { authtoken: { email } = {} } =
    JSON.parse(decodeURIComponent(authTokenCookie.value)) || {};

  console.log(
    email || "No email found. Please re-authenticate with the `auth` command."
  );
};

export default whoami;
