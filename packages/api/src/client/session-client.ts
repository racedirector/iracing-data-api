import { IRACING_DATA_API_URL } from "@/constants";
import { allCookiesValid } from "@/util";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import IRacingAPIClient from "./client";

export class IRacingAPISessionClient extends IRacingAPIClient {
  get cookieJar() {
    return this._cookieJar;
  }

  constructor(private _cookieJar: CookieJar = new CookieJar()) {
    const client = wrapper(
      axios.create({
        baseURL: IRACING_DATA_API_URL,
        withCredentials: true,
        jar: _cookieJar,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    super(client);
  }

  /**
   * Checks if we have a valid session and returns the email of the currently logged in user.
   * @returns the email of the currently logged in user or null
   */
  whoami(): string | null {
    const cookies = this.cookieJar.getCookiesSync(IRACING_DATA_API_URL);
    if (allCookiesValid(cookies)) {
      const authTokenCookie = cookies.find(
        (cookie) => cookie.key === "authtoken_members"
      );

      if (authTokenCookie) {
        const { authtoken: { email = null } = {} } =
          JSON.parse(decodeURIComponent(authTokenCookie.value)) || {};

        return email;
      }
    }

    return null;
  }
}
