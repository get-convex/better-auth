/**
 * SSO OIDC-only plugin for @convex-dev/better-auth.
 *
 * This is a Convex-compatible reimplementation of the SSO plugin from
 * @better-auth/sso that supports OIDC only (no SAML). It has zero
 * Node.js-specific dependencies (no samlify, no fs, no stream, no
 * node:crypto), making it compatible with both the Convex Edge runtime
 * and the Node.js runtime.
 *
 * Usage:
 *   import { ssoOidc } from "@convex-dev/better-auth/plugins";
 *   plugins: [ssoOidc()]
 *
 * Client usage:
 *   import { ssoOidcClient } from "@convex-dev/better-auth/client/plugins";
 *   plugins: [ssoOidcClient()]
 */

import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { generateRandomString } from "better-auth/crypto";
import {
  HIDE_METADATA,
  createAuthorizationURL,
  generateState,
  parseState,
  validateAuthorizationCode,
  validateToken,
} from "better-auth";
import { setSessionCookie } from "better-auth/cookies";
import { handleOAuthUserInfo } from "better-auth/oauth2";
import type { BetterAuthPluginDBSchema } from "@better-auth/core/db";
import { decodeJwt } from "jose";
import { betterFetch, BetterFetchError } from "@better-fetch/fetch";
import z from "zod";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function safeJsonParse(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "object") return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  return null;
}

function validateEmailDomain(email: string, domain: string): boolean {
  const emailDomain = email.split("@")[1]?.toLowerCase();
  const providerDomain = domain.toLowerCase();
  if (!emailDomain || !providerDomain) return false;
  return (
    emailDomain === providerDomain || emailDomain.endsWith(`.${providerDomain}`)
  );
}

// ---------------------------------------------------------------------------
// OIDC Discovery
// ---------------------------------------------------------------------------

const DEFAULT_DISCOVERY_TIMEOUT = 10_000;

class DiscoveryError extends Error {
  code: string;
  details?: unknown;
  constructor(
    code: string,
    message: string,
    details?: unknown,
    options?: { cause?: unknown }
  ) {
    super(message);
    if (options?.cause !== undefined) {
      (this as any).cause = options.cause;
    }
    this.name = "DiscoveryError";
    this.code = code;
    this.details = details;
    if (Error.captureStackTrace) Error.captureStackTrace(this, DiscoveryError);
  }
}

const REQUIRED_DISCOVERY_FIELDS = [
  "issuer",
  "authorization_endpoint",
  "token_endpoint",
  "jwks_uri",
] as const;

function parseURL(name: string, endpoint: string, base?: string): URL {
  let url: URL;
  try {
    url = new URL(endpoint, base);
    if (url.protocol === "http:" || url.protocol === "https:") return url;
  } catch (error) {
    throw new DiscoveryError(
      "discovery_invalid_url",
      `The url "${name}" must be valid: ${endpoint}`,
      { url: endpoint },
      { cause: error }
    );
  }
  throw new DiscoveryError(
    "discovery_invalid_url",
    `The url "${name}" must use http or https: ${endpoint}`,
    { url: endpoint, protocol: url.protocol }
  );
}

function computeDiscoveryUrl(issuer: string): string {
  return `${issuer.endsWith("/") ? issuer.slice(0, -1) : issuer}/.well-known/openid-configuration`;
}

function validateDiscoveryDocument(
  doc: Record<string, unknown>,
  configuredIssuer: string
): void {
  const missingFields: string[] = [];
  for (const field of REQUIRED_DISCOVERY_FIELDS) {
    if (!doc[field]) missingFields.push(field);
  }
  if (missingFields.length > 0) {
    throw new DiscoveryError(
      "discovery_incomplete",
      `Discovery document is missing required fields: ${missingFields.join(", ")}`,
      { missingFields }
    );
  }
  const discoveredIssuer = (doc.issuer as string).endsWith("/")
    ? (doc.issuer as string).slice(0, -1)
    : (doc.issuer as string);
  const expectedIssuer = configuredIssuer.endsWith("/")
    ? configuredIssuer.slice(0, -1)
    : configuredIssuer;
  if (discoveredIssuer !== expectedIssuer) {
    throw new DiscoveryError(
      "issuer_mismatch",
      `Discovered issuer "${doc.issuer}" does not match configured issuer "${configuredIssuer}"`,
      { discovered: doc.issuer, configured: configuredIssuer }
    );
  }
}

function selectTokenEndpointAuthMethod(
  doc: Record<string, unknown>,
  existing?: string
): string {
  if (existing) return existing;
  const supported = doc.token_endpoint_auth_methods_supported as
    | string[]
    | undefined;
  if (!supported || supported.length === 0) return "client_secret_basic";
  if (supported.includes("client_secret_basic")) return "client_secret_basic";
  if (supported.includes("client_secret_post")) return "client_secret_post";
  return "client_secret_basic";
}

function normalizeAndValidateUrl(
  name: string,
  endpoint: string,
  issuer: string,
  isTrustedOrigin: (url: string) => boolean
): string {
  let url: string;
  try {
    url = parseURL(name, endpoint).toString();
  } catch {
    const issuerURL = parseURL(name, issuer);
    const basePath = issuerURL.pathname.replace(/\/+$/, "");
    const endpointPath = endpoint.replace(/^\/+/, "");
    url = parseURL(
      name,
      basePath + "/" + endpointPath,
      issuerURL.origin
    ).toString();
  }
  if (!isTrustedOrigin(url)) {
    throw new DiscoveryError(
      "discovery_untrusted_origin",
      `The ${name} "${url}" is not trusted by your trusted origins configuration.`,
      { endpoint: name, url }
    );
  }
  return url;
}

async function discoverOIDCConfig(params: {
  issuer: string;
  existingConfig?: Partial<OidcConfig>;
  isTrustedOrigin: (url: string) => boolean;
  timeout?: number;
}): Promise<OidcConfig> {
  const {
    issuer,
    existingConfig,
    timeout = DEFAULT_DISCOVERY_TIMEOUT,
    isTrustedOrigin,
  } = params;
  const discoveryUrl =
    existingConfig?.discoveryEndpoint || computeDiscoveryUrl(issuer);

  // Validate discovery URL
  const parsedDiscovery = parseURL(
    "discoveryEndpoint",
    discoveryUrl
  ).toString();
  if (!isTrustedOrigin(parsedDiscovery)) {
    throw new DiscoveryError(
      "discovery_untrusted_origin",
      `The discovery endpoint "${parsedDiscovery}" is not trusted.`,
      { url: parsedDiscovery }
    );
  }

  // Fetch discovery document
  const response = await betterFetch(discoveryUrl, {
    method: "GET",
    timeout,
  });
  if (response.error) {
    const { status } = response.error;
    if (status === 404)
      throw new DiscoveryError(
        "discovery_not_found",
        "Discovery endpoint not found",
        { url: discoveryUrl, status }
      );
    throw new DiscoveryError(
      "discovery_unexpected_error",
      `Unexpected error: ${response.error.statusText}`,
      { url: discoveryUrl }
    );
  }
  if (!response.data) {
    throw new DiscoveryError(
      "discovery_invalid_json",
      "Discovery endpoint returned empty response",
      { url: discoveryUrl }
    );
  }
  const doc = response.data as Record<string, unknown>;
  if (typeof doc === "string") {
    throw new DiscoveryError(
      "discovery_invalid_json",
      "Discovery endpoint returned invalid JSON",
      { url: discoveryUrl }
    );
  }

  validateDiscoveryDocument(doc, issuer);

  // Normalize URLs
  const normalizedDoc = { ...doc };
  normalizedDoc.token_endpoint = normalizeAndValidateUrl(
    "token_endpoint",
    doc.token_endpoint as string,
    issuer,
    isTrustedOrigin
  );
  normalizedDoc.authorization_endpoint = normalizeAndValidateUrl(
    "authorization_endpoint",
    doc.authorization_endpoint as string,
    issuer,
    isTrustedOrigin
  );
  normalizedDoc.jwks_uri = normalizeAndValidateUrl(
    "jwks_uri",
    doc.jwks_uri as string,
    issuer,
    isTrustedOrigin
  );
  if (doc.userinfo_endpoint) {
    normalizedDoc.userinfo_endpoint = normalizeAndValidateUrl(
      "userinfo_endpoint",
      doc.userinfo_endpoint as string,
      issuer,
      isTrustedOrigin
    );
  }

  const tokenEndpointAuth = selectTokenEndpointAuthMethod(
    normalizedDoc,
    existingConfig?.tokenEndpointAuthentication
  );

  return {
    issuer: existingConfig?.issuer ?? (normalizedDoc.issuer as string),
    discoveryEndpoint: existingConfig?.discoveryEndpoint ?? discoveryUrl,
    authorizationEndpoint:
      existingConfig?.authorizationEndpoint ??
      (normalizedDoc.authorization_endpoint as string),
    tokenEndpoint:
      existingConfig?.tokenEndpoint ?? (normalizedDoc.token_endpoint as string),
    jwksEndpoint:
      existingConfig?.jwksEndpoint ?? (normalizedDoc.jwks_uri as string),
    userInfoEndpoint:
      existingConfig?.userInfoEndpoint ??
      (normalizedDoc.userinfo_endpoint as string | undefined),
    tokenEndpointAuthentication:
      existingConfig?.tokenEndpointAuthentication ?? tokenEndpointAuth,
    clientId: existingConfig?.clientId ?? "",
    clientSecret: existingConfig?.clientSecret ?? "",
  };
}

function mapDiscoveryErrorToAPIError(error: DiscoveryError): APIError {
  switch (error.code) {
    case "discovery_not_found":
      return new APIError("BAD_REQUEST", {
        message: `OIDC discovery endpoint not found. ${error.message}`,
        code: error.code,
      });
    case "discovery_timeout":
      return new APIError("BAD_REQUEST", {
        message: `OIDC discovery request timed out. ${error.message}`,
        code: error.code,
      });
    case "discovery_untrusted_origin":
      return new APIError("BAD_REQUEST", {
        message: `Untrusted OIDC discovery URL: ${error.message}`,
        code: error.code,
      });
    case "discovery_invalid_json":
      return new APIError("BAD_REQUEST", {
        message: `OIDC discovery returned invalid data: ${error.message}`,
        code: error.code,
      });
    case "discovery_incomplete":
      return new APIError("BAD_REQUEST", {
        message: `OIDC discovery document is missing required fields: ${error.message}`,
        code: error.code,
      });
    case "issuer_mismatch":
      return new APIError("BAD_REQUEST", {
        message: `OIDC issuer mismatch: ${error.message}`,
        code: error.code,
      });
    default:
      return new APIError("INTERNAL_SERVER_ERROR", {
        message: `Unexpected discovery error: ${error.message}`,
        code: "discovery_unexpected_error",
      });
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OidcConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  discoveryEndpoint?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  jwksEndpoint?: string;
  userInfoEndpoint?: string;
  tokenEndpointAuthentication?: string;
  pkce?: boolean;
  scopes?: string[];
  mapping?: {
    id?: string;
    email?: string;
    emailVerified?: string;
    name?: string;
    image?: string;
    extraFields?: Record<string, string>;
  };
  overrideUserInfo?: boolean;
  skipDiscovery?: boolean;
}

interface SsoOidcOptions {
  /**
   * Maximum number of SSO providers a user can register.
   * Can be a static number or a function that receives the user and returns a number.
   * Defaults to 10.
   */
  providersLimit?:
    | number
    | ((user: { id: string; email: string }) => Promise<number> | number);
  /**
   * Whether to trust the email_verified claim from the provider.
   * Defaults to false.
   */
  trustEmailVerified?: boolean;
  /**
   * Default SSO providers that are pre-configured without requiring registration.
   */
  defaultSSO?: Array<{
    providerId: string;
    domain: string;
    oidcConfig: OidcConfig;
    organizationId?: string;
  }>;
  /**
   * Override the model name for the ssoProvider table.
   * Defaults to "ssoProvider".
   */
  modelName?: string;
  /**
   * Override field names.
   */
  fields?: Partial<
    Record<
      | "issuer"
      | "oidcConfig"
      | "userId"
      | "providerId"
      | "organizationId"
      | "domain",
      string
    >
  >;
  /**
   * Called after a user is provisioned via SSO.
   */
  provisionUser?: (options: {
    user: { id: string; email: string; name: string };
    userInfo: Record<string, unknown>;
    token: {
      accessToken?: string;
      refreshToken?: string;
      idToken?: string;
    };
    provider: {
      providerId: string;
      domain: string;
      organizationId?: string | null;
    };
  }) => Promise<void>;
  /**
   * Disable implicit sign-up. Users must explicitly request sign-up.
   */
  disableImplicitSignUp?: boolean;
  /**
   * Options for organization provisioning (requires the organization plugin).
   */
  organizationProvisioning?: {
    disabled?: boolean;
    defaultRole?: string;
    getRole?: (options: {
      user: { id: string; email: string };
      userInfo: Record<string, unknown>;
      provider: {
        providerId: string;
        domain: string;
        organizationId?: string | null;
      };
    }) => Promise<string> | string;
  };
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const oidcConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  discoveryEndpoint: z.string().url().optional(),
  authorizationEndpoint: z.string().url().optional(),
  tokenEndpoint: z.string().url().optional(),
  jwksEndpoint: z.string().url().optional(),
  userInfoEndpoint: z.string().url().optional(),
  tokenEndpointAuthentication: z
    .enum(["client_secret_basic", "client_secret_post"])
    .optional(),
  pkce: z.boolean().optional(),
  scopes: z.array(z.string()).optional(),
  skipDiscovery: z.boolean().optional(),
  overrideUserInfo: z.boolean().optional(),
  mapping: z
    .object({
      id: z.string().optional(),
      email: z.string().optional(),
      emailVerified: z.string().optional(),
      name: z.string().optional(),
      image: z.string().optional(),
      extraFields: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
});

const ssoProviderBodySchema = z.object({
  issuer: z.string(),
  domain: z.string(),
  providerId: z.string(),
  oidcConfig: oidcConfigSchema,
  organizationId: z.string().optional(),
  overrideUserInfo: z.boolean().optional(),
});

const signInSSOBodySchema = z.object({
  email: z.string().optional(),
  organizationSlug: z.string().optional(),
  providerId: z.string().optional(),
  domain: z.string().optional(),
  callbackURL: z.string(),
  errorCallbackURL: z.string().optional(),
  newUserCallbackURL: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  loginHint: z.string().optional(),
  requestSignUp: z.boolean().optional(),
});

const callbackSSOQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Org assignment helpers
// ---------------------------------------------------------------------------

async function assignOrganizationFromProvider(
  ctx: any,
  options: {
    user: { id: string; email: string };
    provider: {
      organizationId?: string | null;
      providerId: string;
      domain: string;
    };
    provisioningOptions?: SsoOidcOptions["organizationProvisioning"];
    token: { accessToken?: string; refreshToken?: string; idToken?: string };
    userInfo: Record<string, unknown>;
  }
): Promise<void> {
  const { user, provider, provisioningOptions } = options;
  if (!provider.organizationId) return;
  if (provisioningOptions?.disabled) return;
  if (!ctx.context.options.plugins?.find((p: any) => p.id === "organization"))
    return;
  const existing = await ctx.context.adapter.findOne({
    model: "member",
    where: [
      { field: "organizationId", value: provider.organizationId },
      { field: "userId", value: user.id },
    ],
  });
  if (existing) return;
  const role = provisioningOptions?.getRole
    ? await provisioningOptions.getRole({
        user,
        userInfo: options.userInfo,
        provider,
      })
    : provisioningOptions?.defaultRole || "member";
  await ctx.context.adapter.create({
    model: "member",
    data: {
      organizationId: provider.organizationId,
      userId: user.id,
      role,
      createdAt: new Date(),
    },
  });
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

const registerSSOProvider = (options?: SsoOidcOptions) => {
  return createAuthEndpoint(
    "/sso/register",
    {
      method: "POST",
      body: ssoProviderBodySchema,
      use: [sessionMiddleware],
      metadata: {
        openapi: {
          operationId: "registerSSOProvider",
          summary: "Register an OIDC SSO provider",
          description:
            "Register an OIDC provider for SSO. Requires an authenticated session.",
          responses: {
            "200": { description: "SSO provider created successfully" },
          },
        },
      },
    },
    async (ctx) => {
      const user = ctx.context.session?.user;
      if (!user) throw new APIError("UNAUTHORIZED");

      const limit =
        typeof options?.providersLimit === "function"
          ? await options.providersLimit(user)
          : (options?.providersLimit ?? 10);
      if (!limit)
        throw new APIError("FORBIDDEN", {
          message: "SSO provider registration is disabled",
        });

      const existingProviders = await ctx.context.adapter.findMany({
        model: "ssoProvider",
        where: [{ field: "userId", value: user.id }],
      });
      if (existingProviders.length >= limit) {
        throw new APIError("FORBIDDEN", {
          message: "You have reached the maximum number of SSO providers",
        });
      }

      const body = ctx.body;
      if (z.string().url().safeParse(body.issuer).error) {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid issuer. Must be a valid URL",
        });
      }

      if (body.organizationId) {
        const member = await ctx.context.adapter.findOne({
          model: "member",
          where: [
            { field: "userId", value: user.id },
            { field: "organizationId", value: body.organizationId },
          ],
        });
        if (!member) {
          throw new APIError("BAD_REQUEST", {
            message: "You are not a member of the organization",
          });
        }
      }

      const existing = await ctx.context.adapter.findOne({
        model: "ssoProvider",
        where: [{ field: "providerId", value: body.providerId }],
      });
      if (existing) {
        throw new APIError("UNPROCESSABLE_ENTITY", {
          message: "SSO provider with this providerId already exists",
        });
      }

      // OIDC Discovery
      let hydratedOIDCConfig: OidcConfig | null = null;
      if (!body.oidcConfig.skipDiscovery) {
        try {
          hydratedOIDCConfig = await discoverOIDCConfig({
            issuer: body.issuer,
            existingConfig: {
              discoveryEndpoint: body.oidcConfig.discoveryEndpoint,
              authorizationEndpoint: body.oidcConfig.authorizationEndpoint,
              tokenEndpoint: body.oidcConfig.tokenEndpoint,
              jwksEndpoint: body.oidcConfig.jwksEndpoint,
              userInfoEndpoint: body.oidcConfig.userInfoEndpoint,
              tokenEndpointAuthentication:
                body.oidcConfig.tokenEndpointAuthentication,
            },
            isTrustedOrigin: ctx.context.isTrustedOrigin,
          });
        } catch (error) {
          if (error instanceof DiscoveryError)
            throw mapDiscoveryErrorToAPIError(error);
          throw error;
        }
      }

      const oidcConfigToStore = JSON.stringify({
        issuer: body.issuer,
        clientId: body.oidcConfig.clientId,
        clientSecret: body.oidcConfig.clientSecret,
        authorizationEndpoint:
          hydratedOIDCConfig?.authorizationEndpoint ??
          body.oidcConfig.authorizationEndpoint,
        tokenEndpoint:
          hydratedOIDCConfig?.tokenEndpoint ?? body.oidcConfig.tokenEndpoint,
        tokenEndpointAuthentication:
          hydratedOIDCConfig?.tokenEndpointAuthentication ??
          body.oidcConfig.tokenEndpointAuthentication ??
          "client_secret_basic",
        jwksEndpoint:
          hydratedOIDCConfig?.jwksEndpoint ?? body.oidcConfig.jwksEndpoint,
        pkce: body.oidcConfig.pkce,
        discoveryEndpoint:
          hydratedOIDCConfig?.discoveryEndpoint ??
          body.oidcConfig.discoveryEndpoint ??
          `${body.issuer}/.well-known/openid-configuration`,
        mapping: body.oidcConfig.mapping,
        scopes: body.oidcConfig.scopes,
        userInfoEndpoint:
          hydratedOIDCConfig?.userInfoEndpoint ??
          body.oidcConfig.userInfoEndpoint,
        overrideUserInfo: body.overrideUserInfo ?? false,
      });

      const provider = await ctx.context.adapter.create({
        model: "ssoProvider",
        data: {
          issuer: body.issuer,
          domain: body.domain,
          oidcConfig: oidcConfigToStore,
          samlConfig: null,
          organizationId: body.organizationId ?? null,
          userId: user.id,
          providerId: body.providerId,
        },
      });

      return ctx.json({
        ...provider,
        oidcConfig: safeJsonParse(provider.oidcConfig),
        samlConfig: null,
        redirectURI: `${ctx.context.baseURL}/sso/callback/${provider.providerId}`,
      });
    }
  );
};

const signInSSO = (options?: SsoOidcOptions) => {
  return createAuthEndpoint(
    "/sign-in/sso",
    {
      method: "POST",
      body: signInSSOBodySchema,
      metadata: {
        openapi: {
          operationId: "signInWithSSO",
          summary: "Sign in with SSO (OIDC)",
          description:
            "Initiate an OIDC SSO sign-in. Resolves the provider from email, domain, or providerId and redirects to the authorization URL.",
          responses: {
            "200": { description: "Authorization URL generated successfully" },
          },
        },
      },
    },
    async (ctx) => {
      const body = ctx.body;
      let { email, organizationSlug, providerId, domain } = body;

      if (
        !options?.defaultSSO?.length &&
        !email &&
        !organizationSlug &&
        !domain &&
        !providerId
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "email, organizationSlug, domain or providerId is required",
        });
      }

      domain = body.domain || email?.split("@")[1];

      let orgId = "";
      if (organizationSlug) {
        const org = await ctx.context.adapter.findOne({
          model: "organization",
          where: [{ field: "slug", value: organizationSlug }],
        });
        orgId = (org as any)?.id || "";
      }

      type ProviderRecord = {
        issuer: string;
        providerId: string;
        userId: string;
        oidcConfig: OidcConfig | undefined;
        domain: string;
        organizationId?: string | null;
      };

      let provider: ProviderRecord | null = null;

      // Check defaultSSO first
      if (options?.defaultSSO?.length) {
        const match = providerId
          ? options.defaultSSO.find((p) => p.providerId === providerId)
          : options.defaultSSO.find((p) => p.domain === domain);
        if (match) {
          provider = {
            issuer: match.oidcConfig.issuer || "",
            providerId: match.providerId,
            userId: "default",
            oidcConfig: match.oidcConfig,
            domain: match.domain,
            organizationId: match.organizationId,
          };
        }
      }

      if (!providerId && !orgId && !domain) {
        throw new APIError("BAD_REQUEST", {
          message: "providerId, orgId or domain is required",
        });
      }

      if (!provider) {
        const raw = await ctx.context.adapter.findOne({
          model: "ssoProvider",
          where: [
            {
              field: providerId
                ? "providerId"
                : orgId
                  ? "organizationId"
                  : "domain",
              value: (providerId || orgId || domain) as string,
            },
          ],
        });
        if (raw) {
          const rawRecord = raw as Record<string, unknown>;
          provider = {
            issuer: rawRecord.issuer as string,
            providerId: rawRecord.providerId as string,
            userId: rawRecord.userId as string,
            domain: rawRecord.domain as string,
            organizationId: rawRecord.organizationId as
              | string
              | null
              | undefined,
            oidcConfig: rawRecord.oidcConfig
              ? (safeJsonParse(rawRecord.oidcConfig) as unknown as
                  | OidcConfig
                  | undefined)
              : undefined,
          };
        }
      }

      if (!provider) {
        throw new APIError("NOT_FOUND", {
          message: "No SSO provider found for the given identifier",
        });
      }
      if (!provider.oidcConfig) {
        throw new APIError("BAD_REQUEST", {
          message: "OIDC provider is not configured",
        });
      }

      const config = provider.oidcConfig;

      let finalAuthUrl = config.authorizationEndpoint;
      if (!finalAuthUrl && config.discoveryEndpoint) {
        const discovery = await betterFetch(config.discoveryEndpoint, {
          method: "GET",
        });
        if (discovery.data) {
          finalAuthUrl = (discovery.data as Record<string, string>)
            .authorization_endpoint;
        }
      }
      if (!finalAuthUrl) {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid OIDC configuration. Authorization URL not found.",
        });
      }

      const state = await generateState(ctx, undefined, false);
      const redirectURI = `${ctx.context.baseURL}/sso/callback/${provider.providerId}`;

      const authorizationURL = await createAuthorizationURL({
        id: provider.issuer,
        options: {
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        },
        redirectURI,
        state: state.state,
        codeVerifier: config.pkce ? state.codeVerifier : undefined,
        scopes: body.scopes ||
          config.scopes || ["openid", "email", "profile", "offline_access"],
        loginHint: body.loginHint || email,
        authorizationEndpoint: finalAuthUrl,
      });

      return ctx.json({ url: authorizationURL.toString(), redirect: true });
    }
  );
};

const callbackSSO = (options?: SsoOidcOptions) => {
  return createAuthEndpoint(
    "/sso/callback/:providerId",
    {
      method: "GET",
      query: callbackSSOQuerySchema,
      allowedMediaTypes: [
        "application/x-www-form-urlencoded",
        "application/json",
      ],
      metadata: { ...HIDE_METADATA },
    },
    async (ctx) => {
      const { code, error, error_description } = ctx.query;

      const stateData = await parseState(ctx);
      if (!stateData) {
        const errorURL =
          ctx.context.options.onAPIError?.errorURL ||
          `${ctx.context.baseURL}/error`;
        throw ctx.redirect(`${errorURL}?error=invalid_state`);
      }

      const { callbackURL, errorURL, newUserURL, requestSignUp } =
        stateData as any;

      if (!code || error) {
        throw ctx.redirect(
          `${errorURL || callbackURL}?error=${error}&error_description=${error_description}`
        );
      }

      type ProviderRecord = {
        issuer: string;
        providerId: string;
        userId: string;
        oidcConfig: OidcConfig | undefined;
        domain: string;
        organizationId?: string | null;
      };

      let provider: ProviderRecord | null = null;

      // Check defaultSSO first
      if (options?.defaultSSO?.length) {
        const match = options.defaultSSO.find(
          (p) => p.providerId === ctx.params.providerId
        );
        if (match) {
          provider = {
            issuer: match.oidcConfig.issuer || "",
            providerId: match.providerId,
            userId: "default",
            oidcConfig: match.oidcConfig,
            domain: match.domain,
            organizationId: match.organizationId,
          };
        }
      }

      if (!provider) {
        const raw = await ctx.context.adapter.findOne({
          model: "ssoProvider",
          where: [{ field: "providerId", value: ctx.params.providerId }],
        });
        if (raw) {
          const rawRecord = raw as Record<string, unknown>;
          provider = {
            issuer: rawRecord.issuer as string,
            providerId: rawRecord.providerId as string,
            userId: rawRecord.userId as string,
            domain: rawRecord.domain as string,
            organizationId: rawRecord.organizationId as
              | string
              | null
              | undefined,
            oidcConfig: rawRecord.oidcConfig
              ? (safeJsonParse(rawRecord.oidcConfig) as unknown as
                  | OidcConfig
                  | undefined)
              : undefined,
          };
        }
      }

      if (!provider) {
        throw ctx.redirect(
          `${errorURL || callbackURL}/error?error=invalid_provider&error_description=provider_not_found`
        );
      }

      const config = provider.oidcConfig;
      if (!config) {
        throw ctx.redirect(
          `${errorURL || callbackURL}/error?error=invalid_provider&error_description=oidc_not_configured`
        );
      }

      // Hydrate missing endpoints via discovery
      let finalConfig = { ...config };
      if (!finalConfig.tokenEndpoint && finalConfig.discoveryEndpoint) {
        const discovery = await betterFetch(finalConfig.discoveryEndpoint);
        if (discovery.data) {
          const doc = discovery.data as Record<string, string>;
          finalConfig = {
            tokenEndpoint: doc.token_endpoint,
            tokenEndpointAuthentication: doc.token_endpoint_auth_method,
            userInfoEndpoint: doc.userinfo_endpoint,
            scopes: ["openid", "email", "profile", "offline_access"],
            ...finalConfig,
          };
        }
      }

      if (!finalConfig.tokenEndpoint) {
        throw ctx.redirect(
          `${errorURL || callbackURL}/error?error=invalid_provider&error_description=token_endpoint_not_found`
        );
      }

      // Exchange code for tokens
      const tokenResponse = await validateAuthorizationCode({
        code,
        codeVerifier: finalConfig.pkce ? stateData.codeVerifier : undefined,
        redirectURI: `${ctx.context.baseURL}/sso/callback/${provider.providerId}`,
        options: {
          clientId: finalConfig.clientId,
          clientSecret: finalConfig.clientSecret,
        },
        tokenEndpoint: finalConfig.tokenEndpoint,
        authentication:
          finalConfig.tokenEndpointAuthentication === "client_secret_post"
            ? "post"
            : "basic",
      }).catch((e) => {
        if (e instanceof BetterFetchError) {
          throw ctx.redirect(
            `${errorURL || callbackURL}?error=invalid_provider&error_description=${e.message}`
          );
        }
        return null;
      });

      if (!tokenResponse) {
        throw ctx.redirect(
          `${errorURL || callbackURL}/error?error=invalid_provider&error_description=token_response_not_found`
        );
      }

      // Extract user info
      let userInfo: {
        id: string;
        email: string;
        emailVerified?: boolean;
        name?: string;
        image?: string;
        [key: string]: unknown;
      } | null = null;

      if (tokenResponse.idToken) {
        const idToken = decodeJwt(tokenResponse.idToken);
        if (!finalConfig.jwksEndpoint) {
          throw ctx.redirect(
            `${errorURL || callbackURL}/error?error=invalid_provider&error_description=jwks_endpoint_not_found`
          );
        }
        const verified = await validateToken(
          tokenResponse.idToken,
          finalConfig.jwksEndpoint
        ).catch((e) => {
          ctx.context.logger.error(e);
          return null;
        });
        if (!verified) {
          throw ctx.redirect(
            `${errorURL || callbackURL}/error?error=invalid_provider&error_description=token_not_verified`
          );
        }
        if (verified.payload.iss !== provider.issuer) {
          throw ctx.redirect(
            `${errorURL || callbackURL}/error?error=invalid_provider&error_description=issuer_mismatch`
          );
        }
        const mapping = finalConfig.mapping || {};
        userInfo = {
          ...Object.fromEntries(
            Object.entries(mapping.extraFields || {}).map(([key, value]) => [
              key,
              verified.payload[value as string],
            ])
          ),
          id: idToken[mapping.id || "sub"] as string,
          email: idToken[mapping.email || "email"] as string,
          emailVerified: options?.trustEmailVerified
            ? (idToken[mapping.emailVerified || "email_verified"] as boolean)
            : false,
          name: idToken[mapping.name || "name"] as string,
          image: idToken[mapping.image || "picture"] as string,
        };
      }

      if (!userInfo) {
        if (!finalConfig.userInfoEndpoint) {
          throw ctx.redirect(
            `${errorURL || callbackURL}/error?error=invalid_provider&error_description=user_info_endpoint_not_found`
          );
        }
        const userInfoResponse = await betterFetch(
          finalConfig.userInfoEndpoint,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
            },
          }
        );
        if (userInfoResponse.error) {
          throw ctx.redirect(
            `${errorURL || callbackURL}/error?error=invalid_provider&error_description=${userInfoResponse.error.message}`
          );
        }
        userInfo = userInfoResponse.data as typeof userInfo;
      }

      if (!userInfo?.email || !userInfo?.id) {
        throw ctx.redirect(
          `${errorURL || callbackURL}/error?error=invalid_provider&error_description=missing_user_info`
        );
      }

      const isTrustedProvider =
        "domainVerified" in provider &&
        (provider as { domainVerified?: boolean }).domainVerified === true &&
        validateEmailDomain(userInfo.email, provider.domain);

      const linked = await handleOAuthUserInfo(ctx, {
        userInfo: {
          email: userInfo.email,
          name: userInfo.name || userInfo.email,
          id: userInfo.id,
          image: userInfo.image,
          emailVerified: options?.trustEmailVerified
            ? userInfo.emailVerified || false
            : false,
        },
        account: {
          idToken: tokenResponse.idToken,
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          accountId: userInfo.id,
          providerId: provider.providerId,
          accessTokenExpiresAt: tokenResponse.accessTokenExpiresAt,
          refreshTokenExpiresAt: tokenResponse.refreshTokenExpiresAt,
          scope: tokenResponse.scopes?.join(","),
        },
        callbackURL,
        disableSignUp: options?.disableImplicitSignUp && !requestSignUp,
        overrideUserInfo: finalConfig.overrideUserInfo,
        isTrustedProvider,
      });

      if (linked.error) {
        throw ctx.redirect(
          `${errorURL || callbackURL}/error?error=${linked.error}`
        );
      }

      const { session, user } = linked.data!;

      if (options?.provisionUser) {
        await options.provisionUser({
          user,
          userInfo,
          token: tokenResponse,
          provider,
        });
      }

      await assignOrganizationFromProvider(ctx, {
        user,
        provider,
        token: tokenResponse,
        userInfo,
        provisioningOptions: options?.organizationProvisioning,
      });

      await setSessionCookie(ctx, { session, user });

      let toRedirectTo: string;
      try {
        toRedirectTo = (
          linked.isRegister ? newUserURL || callbackURL : callbackURL
        ).toString();
      } catch {
        toRedirectTo = linked.isRegister
          ? newUserURL || callbackURL
          : callbackURL;
      }

      throw ctx.redirect(toRedirectTo);
    }
  );
};

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

/**
 * SSO OIDC-only plugin for @convex-dev/better-auth.
 *
 * Drop-in Convex-compatible alternative to `sso()` from `@better-auth/sso`.
 * Supports OIDC providers (Okta, Azure AD OIDC, Google Workspace, etc.).
 * Does NOT support SAML.
 *
 * No Node.js-specific dependencies — works in both Edge and Node.js runtimes.
 */
export function ssoOidc(options?: SsoOidcOptions) {
  return {
    id: "sso",
    endpoints: {
      registerSSOProvider: registerSSOProvider(options),
      signInSSO: signInSSO(options),
      callbackSSO: callbackSSO(options),
    },
    schema: {
      ssoProvider: {
        modelName: options?.modelName ?? "ssoProvider",
        fields: {
          issuer: {
            type: "string",
            required: true,
            fieldName: options?.fields?.issuer ?? "issuer",
          },
          oidcConfig: {
            type: "string",
            required: false,
            fieldName: options?.fields?.oidcConfig ?? "oidcConfig",
          },
          samlConfig: {
            type: "string",
            required: false,
          },
          userId: {
            type: "string",
            references: { model: "user", field: "id" },
            fieldName: options?.fields?.userId ?? "userId",
          },
          providerId: {
            type: "string",
            required: true,
            unique: true,
            fieldName: options?.fields?.providerId ?? "providerId",
          },
          organizationId: {
            type: "string",
            required: false,
            fieldName: options?.fields?.organizationId ?? "organizationId",
          },
          domain: {
            type: "string",
            required: true,
            fieldName: options?.fields?.domain ?? "domain",
          },
        },
      },
    } as BetterAuthPluginDBSchema,
    options,
  };
}

/**
 * Client-side plugin for ssoOidc.
 * Add to createAuthClient plugins alongside ssoOidc() on the server.
 */
export function ssoOidcClient() {
  return {
    id: "sso",
    $InferServerPlugin: {} as ReturnType<typeof ssoOidc>,
  };
}
