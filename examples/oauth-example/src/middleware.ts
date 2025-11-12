import { Configuration } from "@iracing-data/api-client";
import { Request, Response, NextFunction } from "express";
import { jwtDecode } from "jwt-decode";
import oauthClient from "./oauth-client";

export interface IRacingSessionRequest extends Request {
  accessToken?: string;
}

export async function getIRacingSession(
  req: IRacingSessionRequest,
  res: Response,
  next: NextFunction
) {
  req.accessToken = req.get("X-IRACING-ACCESS-TOKEN");

  if (!req.accessToken && req.cookies?.["iracing-session"]) {
    const parsedSession = JSON.parse(req.cookies["iracing-session"]);
    const decoded = (jwtDecode(parsedSession.access_token) as any) || {};
    const exp =
      typeof decoded.exp === "number"
        ? decoded.exp
        : parseInt(decoded.exp || "0", 10);

    // access token still valid
    if (exp && Date.now() / 1000 < exp) {
      req.accessToken = parsedSession.access_token;
      return next();
    }

    // try to refresh if we have a refresh token
    if (parsedSession.refresh_token) {
      try {
        const newSession = await oauthClient.refresh(
          parsedSession.refresh_token
        );
        res.cookie("iracing-session", JSON.stringify(newSession), {
          httpOnly: true,
          secure: true,
        });

        req.accessToken = newSession.access_token;
        return next();
      } catch {
        res.clearCookie("iracing-session");
        return next();
      }
    }

    // no valid access or refresh token
    res.clearCookie("iracing-session");
    return next();
  }

  next();
}

export function setIRacingSessionHeader(req, res, next) {
  if (!req.get("X-IRACING-ACCESS-TOKEN") && req.cookies?.["iracing-session"]) {
    try {
      const session = JSON.parse(req.cookies["iracing-session"]);
      if (session?.access_token) {
        req.headers["x-iracing-access-token"] = session.access_token;
      }
    } catch {
      // ignore cookie parse errors
    }
  }

  next();
}
