# Migration plan: replace `oidc-provider` with `@better-auth/oauth-provider`

This document is the planning pass only. No implementation files should be
changed until this plan is reviewed.

## 1. Surface inventory

### Runtime imports and plugin composition

- `src/plugins/convex/index.ts`
  - Imports `oidcProvider` from `better-auth/plugins/oidc-provider`.
  - Instantiates it inside `convex()` with:
    - `loginPage: "/not-used"`
    - `metadata.issuer: process.env.CONVEX_SITE_URL`
    - `metadata.jwks_uri: ${CONVEX_SITE_URL}${basePath}/convex/jwks`
    - `__skipDeprecationWarning: true`
  - Normalizes and spreads `oidcProvider.hooks.after` into the Convex plugin
    after-hooks.
  - Proxies `oidcProvider.endpoints.getOpenIdConfig` through
    `/convex/.well-known/openid-configuration`.
  - Comments still describe `options.basePath` as "used to pass the basePath to
    the oidcProvider plugin."
  - Existing Convex-specific JWT handling is implemented here with an internal
    `jwtPlugin()` instance, the `convex_jwt` cookie, `/convex/token`,
    `/convex/jwks`, `/convex/latest-jwks`, and `/convex/rotate-keys`.

- `src/auth-options.ts`
  - Used to generate the component schema.
  - Imports `oidcProvider` from `better-auth/plugins/oidc-provider`.
  - Includes `oidcProvider({ loginPage: "/login", __skipDeprecationWarning: true })`
    in the generated schema auth options.
  - Also includes `jwt()` and `convex()` in the same generated schema auth
    options.

- `package.json`
  - Does not depend on `@better-auth/oauth-provider`.
  - Current Better Auth peer range is `>=1.6.9 <1.7.0`; current dev pin is
    `better-auth@1.6.9`.
  - Implementation should add exact pins for both `better-auth` and
    `@better-auth/oauth-provider`. Latest observed during planning:
    `better-auth@1.6.11` and `@better-auth/oauth-provider@1.6.11`.

### Schema surfaces

- `src/component/schema.ts`
  - Currently contains the old/deprecated OIDC-provider schema:
    - `oauthApplication`
      - `name`, `icon`, `metadata`, `clientId`, `clientSecret`,
        `redirectUrls`, `type`, `disabled`, `userId`, `createdAt`, `updatedAt`
      - indexes: `clientId`, `userId`
    - `oauthAccessToken`
      - `accessToken`, `refreshToken`, `accessTokenExpiresAt`,
        `refreshTokenExpiresAt`, `clientId`, `userId`, `scopes`, `createdAt`,
        `updatedAt`
      - indexes: `accessToken`, `refreshToken`, `clientId`, `userId`
    - `oauthConsent`
      - `clientId`, `userId`, `scopes`, `createdAt`, `updatedAt`,
        `consentGiven`
      - indexes: `clientId_userId`, `userId`
    - `jwks`
  - This file is generated from `src/auth-options.ts`, so the implementation
    should regenerate it after replacing the schema plugin.

- Generated component types:
  - `src/component/_generated/component.ts`
  - `src/component/_generated/dataModel.ts`
  - These currently include `oauthApplication`, `oauthAccessToken`,
    `oauthConsent`, and `jwks`.

- Local-install example schemas:
  - `examples/next/convex/betterAuth/generatedSchema.ts`
    - Currently does not include OIDC/OAuth provider tables; it includes base
      auth tables and `jwks`.
  - `examples/next/convex/betterAuth/schema.ts`
    - Wraps the generated schema and adds a custom `user` index.
  - `examples/tanstack/convex/betterAuth/schema.ts`
    - Currently includes base auth tables and `jwks`.

- Schema generation helper:
  - `src/client/create-schema.ts`
    - Manually adds indexes for known schema models.
    - Currently adds `oauthConsent: [["clientId", "userId"]]`.
    - Needs to add indexes for the oauth-provider models and avoid producing
      duplicate/ambiguous index names.

### HTTP route and discovery surfaces

- `src/client/create-client.ts`
  - `registerRoutes()` and `registerRoutesLazy()` register GET/POST
    `pathPrefix: ${basePath}/` and optional CORS handling.
  - Both add a root `/.well-known/openid-configuration` redirect to
    `${CONVEX_SITE_URL}${basePath}/convex/.well-known/openid-configuration`.
  - CORS currently exposes only `Set-Better-Auth-Cookie` plus user-provided
    exposed headers.
  - CORS must expose `WWW-Authenticate` for MCP clients and other OAuth
    clients to read challenge metadata.

- Current public root discovery:
  - `/.well-known/openid-configuration` exists as a redirect.
  - There is no root `/.well-known/oauth-authorization-server`.
  - There is no root `/.well-known/oauth-protected-resource`.

- Current prefixed discovery:
  - `/api/auth/convex/.well-known/openid-configuration` is a Convex wrapper over
    the deprecated OIDC provider metadata.
  - `/api/auth/convex/jwks` is the Convex-compatible JWKS endpoint.

### Public API and exports

- `src/plugins/index.ts`
  - Exports only:
    - `convex`
    - `crossDomain`
  - Needs to export new MCP/OAuth helper functions:
    - `withMcpAuth`
    - `oAuthDiscoveryMetadata`
    - `oAuthProtectedResourceMetadata`

- `src/client/index.ts`
  - Exports `createClient`, `createApi`, and related types.
  - The route registration API should remain compatible, but its internal
    well-known and CORS behavior needs to expand.

- `src/utils/index.ts`
  - JWT cache helpers assume Convex identity JWTs and static JWKS.
  - No OIDC import, but JWT/JWKS behavior must not regress.

### Cross-domain login surfaces

- `src/plugins/cross-domain/index.ts`
  - Rewrites callback URLs for Better Auth sign-in flows.
  - Preserves OAuth state in database mode and skips state cookie checks.
  - Adds a one-time-token continuation flow after `/callback`,
    `/oauth2/callback`, and `/magic-link/verify`.
  - Needs to keep working when `oauth-provider` redirects to the SvelteKit app
    `loginPage` with a signed `oauth_query`.

- `src/plugins/cross-domain/index.test.ts`
  - Covers callback URL defaulting for `/sign-in/oauth2`.
  - Needs additional coverage for `oauth_query` continuation and the
    `/oauth2/continue` path.

### Docs and examples

- `docs/content/docs/framework-guides/sveltekit.mdx`
  - Current SvelteKit guide demonstrates Convex + Better Auth, but not OIDC
    provider configuration or the `/sign-in` continuation for `oauth_query`.
  - This guide is a required deliverable for the implementation pass.

- Other framework guides reference `convex({ authConfig })` and should not need
  broad rewrites unless the `convex()` options shape changes:
  - `docs/content/docs/framework-guides/react.mdx`
  - `docs/content/docs/framework-guides/expo.mdx`
  - `docs/content/docs/framework-guides/tanstack-start.mdx`
  - `docs/content/docs/framework-guides/next.mdx`

- Existing migration docs:
  - `docs/content/docs/migrations/migrate-to-0-11.mdx`
    - Mentions the `oauthApplication.redirectURLs` to `redirectUrls` rename.
  - `docs/content/docs/migrations/migrate-to-0-10.mdx`
    - Documents static JWKS and `jwksRotateOnTokenGenerationError`.
  - `docs/content/docs/migrations/migrate-to-0-8.mdx`
    - Mentions OIDC discovery redirect behavior.

- `README.md`
  - Minimal package overview; needs pinned version note and OAuth provider
    mention.

- `CHANGELOG.md`
  - Needs a migration entry and any unavoidable breaking changes.

### Tests

- Existing relevant tests:
  - `src/plugins/convex/index.test.ts`
  - `src/plugins/cross-domain/index.test.ts`
  - `src/plugins/cross-domain/client.test.ts`
  - `src/client/create-client.test.ts`
  - `src/test/adapter-factory/*`
  - `e2e/tests/*`

- Missing tests to add during implementation:
  - OAuth-provider schema adapter round-trips for every new table.
  - Auth-code-with-PKCE end-to-end.
  - Dynamic Client Registration.
  - MCP discovery/auth/tool-call chain.
  - RP-initiated logout.

## 2. Bundling investigation

### Fixture

I created a throwaway fixture outside the repository at:

```text
/tmp/convex-oauth-provider-fixture
```

Dependencies installed in the fixture:

```text
convex@1.39.1
better-auth@1.6.11
@better-auth/oauth-provider@1.6.11
```

Minimal `convex/auth.ts` used for the bundling check:

```ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { oauthProvider } from "@better-auth/oauth-provider";

export const auth = betterAuth({
  baseURL: process.env.CONVEX_SITE_URL,
  plugins: [
    jwt(),
    oauthProvider({
      loginPage: "/sign-in",
      allowUnauthenticatedClientRegistration: true,
    }),
  ],
});
```

Minimal `convex/http.ts` routed GET/POST `/api/auth/*` to `auth.handler()`.

Command run:

```bash
npx convex dev --once --typecheck disable
```

Observed output:

```text
Setting up a new project...
Configured a local deployment for http://127.0.0.1:3210 ...
- Preparing Convex functions...
Convex functions ready! (744.36ms)
```

### Node built-in / native module results

No Convex bundler rejection occurred. No rejected built-ins or native modules
were listed.

Additional static scan of `@better-auth/oauth-provider@1.6.11` found no direct
imports of the Node built-ins that caused better-auth issue #5314 (`constants`,
`fs`, `path`, `crypto`, `os`, `stream`, `http`, `https`, `buffer`, `util`,
`events`, `url`).

### Strategy

- Current strategy: use the published package directly; no shim, vendoring, or
  `"use node"` split is planned for `@better-auth/oauth-provider@1.6.11`.
- Contingency during implementation:
  - If full component integration reveals an indirect bundling failure that the
    minimal fixture did not hit, keep the workaround inside this component.
  - Prefer a small local shim only for the failing import if it is pure
    compatibility surface.
  - Use `"use node"` actions only for paths that cannot execute in Convex HTTP
    routes and can safely be proxied without changing OAuth semantics.
  - Vendoring is the last resort because it increases maintenance cost and must
    track Better Auth security fixes.

## 3. Schema diff and migration path

### Deprecated OIDC-provider schema currently shipped by the component

From `better-auth/plugins/oidc-provider` and `src/component/schema.ts`:

- `oauthApplication`
  - `clientId`, `clientSecret`, `type`, `name`, `icon`, `metadata`,
    `disabled`, `redirectUrls`, `userId`, `createdAt`, `updatedAt`
- `oauthAccessToken`
  - `accessToken`, `refreshToken`, `accessTokenExpiresAt`,
    `refreshTokenExpiresAt`, `clientId`, `userId`, `scopes`, `createdAt`,
    `updatedAt`
- `oauthConsent`
  - `clientId`, `userId`, `scopes`, `createdAt`, `updatedAt`, `consentGiven`

Some fork users may have even older table names such as `oidcApplication`,
`oidcAccessToken`, and `oidcConsent`; the implementation should document those
as legacy input tables even if the current package already uses `oauth*`.

### New oauth-provider schema

From `@better-auth/oauth-provider@1.6.11`:

- `oauthClient`
  - `clientId` required unique
  - `clientSecret` optional
  - `disabled` optional, default false
  - `skipConsent` optional
  - `enableEndSession` optional
  - `subjectType` optional (`"public"` or `"pairwise"`)
  - `scopes` optional `string[]`
  - `userId` optional
  - `createdAt`, `updatedAt` optional dates
  - DCR metadata fields:
    - `name`, `uri`, `icon`, `contacts`, `tos`, `policy`, `softwareId`,
      `softwareVersion`, `softwareStatement`
  - redirect/logout fields:
    - `redirectUris` required `string[]`
    - `postLogoutRedirectUris` optional `string[]`
  - OAuth client behavior fields:
    - `tokenEndpointAuthMethod`, `grantTypes`, `responseTypes`, `public`,
      `type`, `requirePKCE`, `referenceId`, `metadata`

- `oauthRefreshToken`
  - `token` required unique
  - `clientId` required
  - `sessionId` optional
  - `userId` required
  - `referenceId` optional
  - `expiresAt`, `createdAt`
  - `revoked` optional
  - `authTime` optional
  - `scopes` required `string[]`

- `oauthAccessToken`
  - Reuses the old table name but with incompatible fields:
    - `token` unique instead of `accessToken`
    - `clientId` required
    - `sessionId` optional
    - `userId` optional
    - `referenceId` optional
    - `refreshId` optional
    - `expiresAt`, `createdAt`
    - `scopes` required `string[]` instead of a space-delimited string

- `oauthConsent`
  - Reuses the old table name but with changed fields:
    - `clientId` required
    - `userId` optional
    - `referenceId` optional
    - `scopes` required `string[]`
    - `createdAt`, `updatedAt`
    - no `consentGiven`

### Convex schema generation changes

- Replace the OIDC provider in `src/auth-options.ts` with
  `oauthProvider(...)` and regenerate `src/component/schema.ts`.
- Update `src/client/create-schema.ts` manual indexes:
  - Add `oauthClient` indexes for at least `clientId`, `userId`, and any
    generated unique/reference fields not already handled by `specialFields`.
  - Add `oauthRefreshToken` indexes for `token`, `clientId`, `sessionId`,
    `userId`.
  - Update `oauthAccessToken` indexes to `token`, `clientId`, `sessionId`,
    `userId`, `refreshId`.
  - Keep `oauthConsent` composite lookup as `clientId_userId`; include
    `referenceId` if implementation discovers oauth-provider queries require
    `clientId + userId + referenceId`.
- Ensure `string[]` fields generate as `v.array(v.string())`, which
  `create-schema.ts` already supports.

### Data migration path

Because `oauthAccessToken` and `oauthConsent` reuse table names with different
field shapes, this should be a two-stage migration for deployed users:

1. **Pre-upgrade backup and token invalidation**
   - Document that old OIDC access/refresh tokens cannot be safely reused
     because oauth-provider stores and hashes tokens differently and separates
     refresh tokens into `oauthRefreshToken`.
   - Users should expect existing OAuth clients to reauthorize after the
     upgrade.
   - Existing Better Auth user/session/account data and Convex identity JWT
     behavior should remain intact.

2. **Client migration**
   - Migrate `oauthApplication` or legacy `oidcApplication` rows into
     `oauthClient`:
     - `clientId` -> `clientId`
     - `clientSecret` -> `clientSecret`
       - If old secrets were stored plaintext and new config uses hashed
         secrets, require either secret rotation or a one-time admin re-create
         because hashing cannot recover the original if already hashed.
     - `name`, `icon`, `metadata`, `disabled`, `userId`, `createdAt`,
       `updatedAt` -> same semantic fields.
     - `redirectUrls` comma/string value -> `redirectUris: string[]`.
     - `type`:
       - old `"web"` -> new `type: "web"`,
         `tokenEndpointAuthMethod: "client_secret_basic"` or default
       - old `"native"` / `"public"` / `"user-agent-based"` ->
         `tokenEndpointAuthMethod: "none"`, `public: true`
     - first-party clients should be recreated/admin-updated with:
       - `skipConsent: true`
       - `enableEndSession: true` where RP-initiated logout is required
       - `subjectType: "public"` unless explicitly configured for pairwise
     - `postLogoutRedirectUris` must be populated for Capacitor and web logout
       callbacks.

3. **Consent migration**
   - Migrate `oauthConsent` or legacy `oidcConsent` rows where
     `consentGiven === true`.
   - Convert `scopes` from space-delimited strings to `string[]`.
   - Drop denied/false consent rows.
   - If `referenceId` is not available, leave undefined.

4. **Token cleanup**
   - Delete old `oauthAccessToken` / `oidcAccessToken` rows after clients are
     migrated.
   - New `oauthAccessToken` and `oauthRefreshToken` rows will be created by
     oauth-provider during fresh authorization.

5. **Migration tooling**
   - Add documented Convex migration helpers rather than automatic destructive
     migration in request paths.
   - For component installs, expose internal/admin functions or a documented
     one-off script that users can copy into their app.
   - For local installs, document `npx auth generate` plus a Convex migration
     component recipe.

## 4. JWT/JWKS plan

### Current behavior to preserve

- `convex()` issues Convex-compatible identity JWTs using Better Auth's JWT
  plugin internals.
- The Convex identity JWT:
  - issuer: `CONVEX_SITE_URL`
  - audience: `"convex"`
  - default payload: user fields except `id` and `image`, plus `sessionId` and
    `iat`
  - supports `jwt.definePayload`
  - is stored in `better-auth.convex_jwt`
- Static JWKS optimization:
  - `convex({ jwks: process.env.JWKS })` reads static JWKS instead of querying
    the database on every `/convex/jwks` or token operation.
  - `getAuthConfigProvider({ jwks })` points Convex to a data URI JWKS so
    Convex WebSocket auth validation stays fast.

### Required oauth-provider coordination

`@better-auth/oauth-provider` expects the real Better Auth `jwt` plugin to be
registered unless `disableJwtPlugin: true`. Disabling the JWT plugin would fall
back to HS256 ID tokens for some clients and would violate the requirement that
RPs and Convex see the same JWKS-backed signing keys. Therefore the
implementation should keep `disableJwtPlugin: false`.

Planned approach:

1. Create exactly one shared JWT plugin configuration from the existing
   `convex()` JWT/JWKS options.
2. Make that same JWT plugin visible to oauth-provider and use it for:
   - Convex identity JWT cookie/token generation.
   - OAuth/OIDC ID tokens.
   - JWT access tokens when `resource`/audience is requested.
   - `/jwks` and `/convex/jwks` public key output.
3. Keep `/convex/jwks` as the Convex-compatible JWKS URL and add/ensure the
   standard `/jwks` endpoint from the shared JWT plugin is reachable for
   oauth-provider metadata.
4. Configure oauth-provider metadata so:
   - `issuer` is the Convex site origin (`CONVEX_SITE_URL`), not the SvelteKit
     app origin.
   - `jwks_uri` points to the shared JWKS endpoint.
   - root and prefixed well-known routes return consistent metadata.
5. Audit `convex().jwt.definePayload`:
   - Keep it scoped to Convex identity JWTs only.
   - Use oauth-provider's `customIdTokenClaims`, `customUserInfoClaims`, and
     `customAccessTokenClaims` for OAuth/OIDC tokens.
   - Do not leak Convex-only `sessionId`, application-specific user fields, or
     non-OIDC claims into ID tokens unless explicitly configured.

Implementation risk to resolve in code:

- The current `convex()` plugin internally instantiates `jwtPlugin()` but does
  not register a plugin with id `"jwt"` in the user's Better Auth plugin list.
  oauth-provider calls `ctx.getPlugin("jwt")`.
- The first implementation step should spike the least-breaking way to satisfy
  this:
  - Preferred: make `convex()` expose the shared JWT plugin to Better Auth's
    plugin registry while preserving the existing `convex()` public export and
    Convex endpoints.
  - Acceptable if Better Auth registry constraints prevent that: document a new
    helper/configuration that inserts `jwt(sharedOptions)` once and make
    `convex()` reuse that instance. This would be a breaking or semi-breaking
    configuration change and must be called out in `CHANGELOG.md`.

## 5. OAuth-provider integration plan

### Component options

Extend `convex()` options conservatively:

```ts
convex({
  authConfig,
  jwks,
  jwt,
  oauthProvider: {
    enabled: true,
    loginPage,
    consentPage,
    allowDynamicClientRegistration,
    allowUnauthenticatedClientRegistration,
    allowPublicClientPrelogin,
    scopes,
    validAudiences,
    cachedTrustedClients,
    pairwiseSecret,
    ...safePassThroughOptions
  },
});
```

Notes:

- `allowUnauthenticatedClientRegistration` should be configurable, but only
  effective when `allowDynamicClientRegistration` is also true.
- `pairwiseSecret` should come from Convex env (`process.env.PAIRWISE_SECRET`
  or documented user-chosen name). The plugin should validate the minimum
  length before deployment fails at runtime.
- `loginPage` should support an absolute SvelteKit URL, not only a path, so
  `<deployment>.convex.site/oauth2/authorize` can redirect to
  `https://app.example.com/sign-in?...`.
- First-party SvelteKit and Capacitor clients should be created/admin-updated
  with `skipConsent: true`; Capacitor should also get `enableEndSession: true`
  and `postLogoutRedirectUris`.

### Endpoint behavior

Replace OIDC provider endpoint/hook usage in `src/plugins/convex/index.ts`:

- Remove `better-auth/plugins/oidc-provider` import.
- Add `@better-auth/oauth-provider`.
- Use oauth-provider hooks:
  - Its before-hook verifies and stores `oauth_query` continuation state.
  - Its after-hook continues authorization after login.
  - Preserve Convex JWT cookie set/clear hooks.
- Use oauth-provider endpoints:
  - `/oauth2/authorize`
  - `/oauth2/token`
  - `/oauth2/consent`
  - `/oauth2/continue`
  - `/oauth2/register`
  - `/oauth2/userinfo`
  - `/oauth2/end-session`
  - `/oauth2/introspect`
  - `/oauth2/revoke`
  - client/consent management endpoints
  - `/.well-known/oauth-authorization-server`
  - `/.well-known/openid-configuration`
- Keep existing Convex-specific endpoints:
  - `/convex/token`
  - `/convex/jwks`
  - `/convex/latest-jwks`
  - `/convex/rotate-keys`

### Well-known routes

Add root and prefixed discovery support:

- OpenID Connect:
  - `/.well-known/openid-configuration`
  - `${basePath}/.well-known/openid-configuration`
  - Existing `${basePath}/convex/.well-known/openid-configuration` should
    remain as a compatibility alias if possible.

- OAuth Authorization Server (RFC 8414):
  - `/.well-known/oauth-authorization-server`
  - `/.well-known/oauth-authorization-server/api/auth` for issuer-path style
    insertion when issuer/basePath requires it.
  - `${basePath}/.well-known/oauth-authorization-server`

- OAuth Protected Resource (RFC 9728):
  - `/.well-known/oauth-protected-resource`
  - `/.well-known/oauth-protected-resource/<resource-path>` where applicable.
  - `${basePath}/.well-known/oauth-protected-resource`

- CORS:
  - Add `WWW-Authenticate` to default exposed headers whenever CORS is enabled.
  - For metadata routes, allow GET from `*` or from configured trusted origins
    depending on current route helper conventions.

## 6. MCP surface plan

Upstream status during planning:

- `better-auth/plugins/mcp` still documents itself as based on the deprecated
  OIDC Provider plugin and "soon deprecated in favor of the OAuth Provider
  Plugin."
- It exports `withMcpAuth`, `oAuthDiscoveryMetadata`, and
  `oAuthProtectedResourceMetadata`, but those helpers depend on `mcp()` /
  `auth.api.getMcpSession`, not the new oauth-provider session/token model.
- `@better-auth/oauth-provider` exports `mcpHandler()` and a
  `oauthProviderResourceClient()`, but not same-named helper exports.

Therefore this component should implement Convex-adapted helpers now rather
than depend on the legacy MCP plugin.

### Proposed exports

Add a new module, likely `src/plugins/mcp/index.ts`, re-exported from
`src/plugins/index.ts`:

- `withMcpAuth(authOrOptions, handler, opts?)`
  - Accepts a Web-standard `Request` and returns `Response`, matching Convex
    HTTP action ergonomics.
  - Extracts bearer token.
  - Verifies JWT access tokens using `better-auth/oauth2.verifyAccessToken` or
    `oauthProviderResourceClient(auth).verifyAccessToken`.
  - Supports required scopes and expected `audience`/resource.
  - On unauthenticated/invalid token:
    - returns 401
    - sets `WWW-Authenticate:
      Bearer resource_metadata="<resource>/.well-known/oauth-protected-resource"`
    - sets `Access-Control-Expose-Headers: WWW-Authenticate`
  - Passes a typed session/payload object to the handler containing at least
    `userId`/`sub`, `clientId`/`azp`, `scope`, and raw JWT payload.

- `oAuthDiscoveryMetadata(auth, opts?)`
  - Returns a Convex-compatible handler that emits RFC 8414 metadata from the
    oauth-provider configuration.
  - Should use `oauthProviderAuthServerMetadata(auth)` if it works with Convex
    request/response paths; otherwise use `auth.api.getOAuthServerConfig` and
    wrap in a Response.

- `oAuthProtectedResourceMetadata(authOrOptions, opts?)`
  - Returns RFC 9728 protected resource metadata.
  - Prefer `oauthProviderResourceClient(auth).getProtectedResourceMetadata()`.
  - Allow overriding `resource`, `authorization_servers`, `scopes_supported`,
    and bearer methods.

### Convex HTTP usage shape

Example target API:

```ts
http.route({
  path: "/mcp",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    return withMcpAuth(
      {
        issuer: process.env.CONVEX_SITE_URL!,
        jwksUrl: `${process.env.CONVEX_SITE_URL}/api/auth/convex/jwks`,
        audience: `${process.env.CONVEX_SITE_URL}/mcp`,
        scopes: ["openid"],
      },
      async (req, session) => {
        // call MCP server transport
      }
    )(req);
  }),
});
```

The docs should also show root discovery routes for MCP clients that ignore the
prefixed Better Auth metadata route.

## 7. Cross-domain login redirect plan

The oauth-provider login flow redirects unauthenticated `/oauth2/authorize`
requests to `loginPage` with a signed `oauth_query`. To keep Convex as the
issuer while the UI lives on SvelteKit:

1. Allow `oauthProvider.loginPage` to be an absolute URL on the SvelteKit app
   origin, e.g. `https://app.supp.co/sign-in`.
2. Ensure the signed `oauth_query` is preserved exactly.
3. Update the SvelteKit `/sign-in` page to:
   - read `oauth_query` from `url.searchParams`
   - pass it to Better Auth login calls in the request body where required
   - after successful login, call `/api/auth/oauth2/continue` with the
     `oauth_query` if oauth-provider does not auto-continue through the normal
     login endpoint
   - redirect the browser to the returned `url`
4. Keep the `crossDomain` plugin behavior:
   - `trustedOrigins` includes the SvelteKit origin.
   - callback URLs are rewritten to the app origin.
   - `better-auth-cookie` / `Set-Better-Auth-Cookie` bridge still works for
     browser flows.
   - one-time-token flow remains for social login and magic links.
5. Add tests that simulate a Convex-site authorize request redirecting to an
   app-origin sign-in and resuming via `oauth_query`.

## 8. RP-initiated logout plan

- Ensure `/oauth2/end-session` is mounted through the oauth-provider endpoints.
- First-party clients that need logout must be admin-created or migrated with:
  - `enableEndSession: true`
  - `postLogoutRedirectUris` containing the web and Capacitor callback URIs
  - `skipConsent: true`
- Capacitor flow:
  - client starts ASWebAuthenticationSession with `id_token_hint`.
  - Convex `/oauth2/end-session` validates the hint.
  - Better Auth session is destroyed.
  - Convex `convex_jwt` cookie is cleared by existing sign-out/session-clear
    hook or by an added matcher for `/oauth2/end-session`.
  - Browser redirects to validated `post_logout_redirect_uri`.
- Add e2e coverage for the `id_token_hint` round-trip and session destruction.

## 9. Test plan

The implementation PR is not done until all of the following pass against a
fresh Convex deployment.

### Unit tests

- Schema adapter round-trips for all oauth-provider tables:
  - `oauthClient`
  - `oauthRefreshToken`
  - `oauthAccessToken`
  - `oauthConsent`
- Date conversion and `string[]` conversion through `convexAdapter`.
- Migration helpers:
  - old `oauthApplication` / `oidcApplication` -> `oauthClient`
  - old consent string scopes -> array scopes
  - old token cleanup
- Route registration:
  - root and prefixed OpenID metadata
  - root and prefixed OAuth Authorization Server metadata
  - root and prefixed Protected Resource metadata
  - CORS exposes `WWW-Authenticate`
- JWT/JWKS:
  - `convex()` identity JWT still has `aud: "convex"` and user/session payload.
  - oauth-provider ID token uses same JWKS key set.
  - static JWKS path avoids database lookup.
- Cross-domain:
  - `oauth_query` survives login-page redirect and `/oauth2/continue`.
- MCP helpers:
  - missing/invalid token returns 401 with `WWW-Authenticate`.
  - valid token calls handler with session/payload.

### E2E OAuth/OIDC test

Add `tests/e2e/` or extend existing `e2e/` with an OAuth client-driven test
that:

1. Starts against a fresh Convex deployment.
2. Performs RFC 7591 Dynamic Client Registration unauthenticated:
   - `allowDynamicClientRegistration: true`
   - `allowUnauthenticatedClientRegistration: true`
   - public client with `token_endpoint_auth_method: "none"`
3. Walks auth-code-with-PKCE:
   - request `/oauth2/authorize`
   - login through first-party web flow
   - continue consent or skip consent for trusted first-party client
   - exchange code at `/oauth2/token`
4. Validates ID token signature against `/jwks` and/or `/convex/jwks`.
5. Calls `/oauth2/userinfo` with access token.
6. Calls `/oauth2/end-session` with `id_token_hint`.
7. Confirms Better Auth session and Convex identity cookie/token are destroyed.

### E2E MCP test

Add a test using `@modelcontextprotocol/inspector` against a stub MCP server
protected by the new `withMcpAuth` helper:

1. Discover protected resource metadata.
2. Discover authorization server metadata.
3. Perform DCR.
4. Authorize and exchange token.
5. Call a stub MCP tool successfully.
6. Assert unauthenticated calls return `WWW-Authenticate` and that CORS exposes
   the header.

### Regression tests

- Existing unit suite: `npm test`.
- Existing lint/typecheck: `npm run lint` and `npm run typecheck`.
- Existing e2e suite: `npm run test:e2e`.
- Existing examples should still typecheck, especially React, Expo, Next, and
  TanStack Start.

## 10. Documentation plan

- `README.md`
  - Add OAuth provider capability summary.
  - Document exact pinned versions for `better-auth` and
    `@better-auth/oauth-provider`.
  - Mention static JWKS remains the recommended Convex WebSocket validation
    optimization.

- `CHANGELOG.md`
  - Add migration entry.
  - Clearly state any unavoidable breaking configuration changes.
  - Document old OAuth/OIDC token invalidation if old tokens cannot be migrated.

- `docs/content/docs/framework-guides/sveltekit.mdx`
  - Add OIDC provider configuration using Convex as issuer.
  - Add first-party SvelteKit client setup.
  - Add `/sign-in` example that handles `oauth_query`.
  - Add DCR/MCP notes where relevant.

- New or updated migration doc:
  - Existing data migration from:
    - `oidcApplication`, `oidcAccessToken`, `oidcConsent`
    - `oauthApplication`, old-shape `oauthAccessToken`, old-shape
      `oauthConsent`
  - Regenerate schema instructions for local installs.
  - First-party client recreation/admin update instructions.
  - Pairwise subject setup with `pairwiseSecret` in Convex env.
  - RP-initiated logout setup.

## 11. Risks and open questions

- **JWT plugin visibility:** oauth-provider requires `ctx.getPlugin("jwt")`.
  The current `convex()` plugin uses `jwtPlugin()` internally but does not
  register a `"jwt"` plugin. This is the biggest design risk and must be
  resolved before broad implementation.
- **Table name collision:** new `oauthAccessToken` reuses an existing table
  name with incompatible fields. A careless schema replacement could break
  deployments with old data. The implementation needs a documented migration
  and likely a transitional schema/migration strategy.
- **Token migration:** old OIDC access and refresh tokens likely should be
  invalidated instead of transformed. This is safer but causes reauthorization.
- **MCP helper compatibility:** upstream `better-auth/plugins/mcp` has not yet
  migrated to oauth-provider. Local helpers must be carefully aligned with MCP
  RFC 9728 / RFC 8414 expectations.
- **Cross-origin continuation:** oauth-provider uses signed `oauth_query`.
  The SvelteKit app must preserve it exactly across login UI actions.
- **Pairwise subjects:** `pairwiseSecret` must be stable and secret. Rotating it
  changes `sub` for pairwise clients and can break RP account linking.
- **Logout semantics:** `/oauth2/end-session` requires clients to be explicitly
  enabled. First-party client migration must set `enableEndSession` and
  `postLogoutRedirectUris`.
- **Shopify Customer Account API:** Shopify may enforce strict OIDC metadata,
  subject, and claim expectations. Add a manual verification checklist after
  the generic OIDC e2e passes.
- **Claude / Claude Code MCP:** MCP client behavior around unauthenticated DCR
  is still evolving. Keep `allowUnauthenticatedClientRegistration` configurable
  and documented as compatibility behavior.
