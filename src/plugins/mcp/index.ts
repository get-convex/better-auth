import {
  mcpHandler,
  oauthProviderAuthServerMetadata,
} from "@better-auth/oauth-provider";
import type { ResourceServerMetadata } from "@better-auth/oauth-provider";
import type { verifyAccessToken } from "better-auth/oauth2";
import type { JWTPayload } from "jose";

type VerifyOptions = Parameters<typeof verifyAccessToken>[1];

type Awaitable<T> = T | Promise<T>;

type WithMcpAuthOptions = {
  resourceMetadataMappings?: Record<string, string>;
};

const exposeAuthenticateHeader = (response: Response) => {
  if (
    response.status !== 401 ||
    !response.headers.has("WWW-Authenticate") ||
    response.headers.has("Access-Control-Expose-Headers")
  ) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Expose-Headers", "WWW-Authenticate");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const withMcpAuth = (
  verifyOptions: VerifyOptions,
  handler: (req: Request, jwt: JWTPayload) => Awaitable<Response>,
  opts?: WithMcpAuthOptions
) => {
  const protectedHandler = mcpHandler(verifyOptions, handler, {
    resourceMetadataMappings: opts?.resourceMetadataMappings ?? {},
  });
  return async (req: Request) => {
    const response = await protectedHandler(req);
    return exposeAuthenticateHeader(response);
  };
};

export const oAuthDiscoveryMetadata = oauthProviderAuthServerMetadata;

export const oAuthProtectedResourceMetadata = (opts: {
  resource: string;
  authorizationServers: string[];
  scopesSupported?: string[];
  bearerMethodsSupported?: Array<"header" | "body">;
  extraMetadata?: Partial<ResourceServerMetadata>;
}) => {
  return async () => {
    return Response.json({
      resource: opts.resource,
      authorization_servers: opts.authorizationServers,
      scopes_supported: opts.scopesSupported,
      bearer_methods_supported: opts.bearerMethodsSupported ?? ["header"],
      ...opts.extraMetadata,
    });
  };
};
