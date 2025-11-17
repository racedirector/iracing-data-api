import {
  OAuthClientOptions,
  IRacingOAuthTokenResponse,
  OAuthClient,
} from "@iracing-data/oauth-client";
import {
  createEndpoint as createEndpointFn,
  createRouter as createRouterFn,
  EndpointContext,
  RouterConfig,
} from "better-call";
import { toNodeHandler } from "better-call/node";
import {
  createIRacingOAuthClientMiddleware,
  iRacingSessionHeaderMiddleware,
  oauthServiceClientMiddleware,
} from "./middleware";

type CallbackResponseContext = Pick<
  EndpointContext<string, { method: "GET"; requireRequest: true }>,
  | "setHeader"
  | "setStatus"
  | "getHeader"
  | "getCookie"
  | "getSignedCookie"
  | "setCookie"
  | "setSignedCookie"
  | "redirect"
  | "error"
  | "request"
>;

interface CreateRouterWithClientOptions {
  oauthClient: OAuthClient;
}

interface CreateRouterWithClientOptionsOptions {
  oauthConfig: OAuthClientOptions;
}

export interface CreateRouterOptions
  extends RouterConfig,
    Partial<CreateRouterWithClientOptions>,
    Partial<CreateRouterWithClientOptionsOptions> {
  /** The path at which to mount the callback. This should match the redirect_uri path registered with iRacing. */
  callbackPath: string;
  /** Called when a token is received from the iRacing OAuth service. */
  onCallback: (
    session: IRacingOAuthTokenResponse,
    context: CallbackResponseContext
  ) => void;
  /** Called when a session is successfully invalidated. */
  onSignOut: (token: string, context: CallbackResponseContext) => void;
}

export function createRouter({
  oauthConfig,
  oauthClient,
  callbackPath = "/oauth/iracing/callback",
  onCallback,
  onSignOut,
  ...options
}: CreateRouterOptions) {
  const oauthMiddleware = createIRacingOAuthClientMiddleware({
    oauthClient,
    clientOptions: oauthConfig,
  });

  const createEndpoint = createEndpointFn.create({
    use: [oauthMiddleware],
  });

  return createRouterFn(
    {
      signIn: createEndpoint(
        "/signin",
        {
          method: "GET",
        },
        async ({ context: { oauth }, redirect }) => {
          const { url } = await oauth.authorize();
          return redirect(url.toString());
        }
      ),
      signOut: createEndpoint(
        "/signout",
        {
          method: "GET",
          requireHeaders: true,
          requireRequest: true,
          use: [iRacingSessionHeaderMiddleware, oauthServiceClientMiddleware],
        },
        async ({
          context: { oauthService, iracingSession },
          request,
          getHeader,
          getCookie,
          getSignedCookie,
          setHeader,
          setStatus,
          setCookie,
          setSignedCookie,
          redirect,
          error,
        }) => {
          await oauthService.revokeCurrentPost();

          if (iracingSession) {
            onSignOut(iracingSession, {
              request,
              getHeader,
              getCookie,
              getSignedCookie,
              setHeader,
              setStatus,
              setCookie,
              setSignedCookie,
              redirect,
              error,
            });
          }
        }
      ),
      callback: createEndpoint(
        callbackPath,
        {
          method: "GET",
          requireRequest: true,
        },
        async ({
          context: { oauth },
          query,
          request,
          getHeader,
          getCookie,
          getSignedCookie,
          setHeader,
          setStatus,
          setCookie,
          setSignedCookie,
          redirect,
          error,
        }) => {
          const session = await oauth.callback(new URLSearchParams(query));

          onCallback(session, {
            request,
            getHeader,
            getCookie,
            getSignedCookie,
            setHeader,
            setStatus,
            setCookie,
            setSignedCookie,
            redirect,
            error,
          });
        }
      ),
    },
    options
  );
}

export { toNodeHandler };
export default createRouter;
