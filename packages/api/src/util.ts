import { Cookie } from "tough-cookie";

export const allCookiesValid = (cookies: Cookie[]) =>
  cookies.every((cookie) => cookie.TTL() > 0);
