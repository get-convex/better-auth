# Changelog

## 0.12.0

- BREAKING: require better-auth `>=1.6.2 <1.7.0`
- feat(adapter): honor `mode: "sensitive" | "insensitive"` on where clauses. Index-backed paths bail out to scan-filter for insensitive clauses since Convex indexes are byte-compared
- fix(adapter): normalize undefined as null for `eq null` / `ne null` comparisons so upstream IS NULL / IS NOT NULL tests pass
- fix(plugins): pass `asResponse: false` to 7 internal `.endpoints.*` calls so v1.6.0's new `shouldReturnResponse` default doesn't silently wrap results in Response objects (would have broken JWT cookies after sign-in and cross-domain one-time-token verification)
- feat(plugins): expose `version` field on `convex`, `convexClient`, `crossDomain`, `crossDomainClient` matching the new `BetterAuthPlugin.version` / `BetterAuthClientPlugin.version` convention
- fix: suppress oidc-provider deprecation warning via `__skipDeprecationWarning: true` at both call sites (internal use only; migration to `@better-auth/oauth-provider` tracked separately)
- test: wire upstream `caseInsensitiveTestSuite` (12 tests) into the base adapter profile
- test: add after-hook regression test that catches silent JWT cookie breakage if `asResponse: false` is ever removed
- test: add cross-domain `verifyOneTimeToken` regression test mirroring the convex pattern

### Migration

```bash
npm install @convex-dev/better-auth@latest better-auth@latest
npx auth upgrade
```

Bump `better-auth` in your own `package.json` to `^1.6.2`. The `better-auth` package itself is ~46% smaller in 1.6.

### Inherited behavior changes from better-auth 1.6.0 / 1.6.1

No code change in this component; users on Convex deployments will observe:

- `twoFactor` table gains a `verified` boolean column (defaults to `true`). New TOTP enrollments are created with `verified: false` and promoted on successful code verification, preventing abandoned enrollments from blocking sign-in. Convex users must regenerate their schema to pick up the new field
- `session.freshAge` now measured from `session.createdAt`, not `session.updatedAt`. Sensitive endpoints (`deleteUser`, `changePassword`, 2FA management) reject sessions older than `freshAge` from creation regardless of recent activity. Boundary tightened from strict `<` to `>=`
- `requestPasswordReset` now runs `originCheck` on `redirectTo`. Reset URLs not in `trustedOrigins` will return 403. Add your reset destination to `trustedOrigins` if you hit this
- `checkPassword` now throws `INVALID_PASSWORD` instead of `CREDENTIAL_ACCOUNT_NOT_FOUND` when no credential account exists. UI catching the old code in `deleteUser`, `changePassword`, or 2FA flows must switch to `INVALID_PASSWORD`
- `genericOAuth` with `verification.storeIdentifier: "hashed"` no longer double-hashes state. One-time deterministic flow change on upgrade
- `auth.$Infer` and `auth.$ERROR_CODES` no longer collapse to `any` when generic options bleed through. Strict TS users may see new compile errors on `auth.ts` configs that relied on `any`-coercion
- Stateless `cookieCache.maxAge` now defaults to `session.expiresIn || 7 days`. Cookies persist longer across browser restarts on stateless setups
- Existing account cookies from 1.5 miss the cookie fast-path once post-upgrade and fall back to the DB query. No data loss; transient cache miss
- `phoneNumber({ sendOTP })` errors now bubble up instead of being silently swallowed (only matters if you set `advanced.backgroundTasks.handler`)
- `updateUser({ username })` with the same username now succeeds; with a taken username now errors `USERNAME_IS_ALREADY_TAKEN`; partial updates no longer rewrite `displayUsername`
- `/magic-link/verify` response gained a `session` field in the token-flow branch (additive)
- Password hashing delegates to `@better-auth/utils/password`. Convex bundler resolves to the pure-JS fallback (`@noble/hashes`) since `node:crypto` is unavailable in the V8 isolate. Existing hashes remain compatible
- `oidc-provider` plugin is deprecated and will be removed in the next major better-auth release. This component suppresses the warning for its internal use only

## 0.11.4

- fix: accept BaseURLConfig type for baseURL option (#310)

## 0.11.3

- Lazy route registration for reduced memory usage (#302)

## 0.11.2

- fix: return dates as numbers from customTransformOutput (#298)
- fix(adapter): match composite index fields by real names (#297)

## 0.11.1

- chore: add missing generated types

## 0.11.0

- fix: prevent proxy compression from breaking server-side token fetch (#295)
- feat: migrate to Better Auth 1.5 (#292) @wiesson @onmax

## 0.10.13

- fix: add optional chaining for ctx.path in crossDomain before-hooks (#279)
- fix(package): remove spurious react-dom peer dependency (#278) @ramonclaudio

## 0.10.12

- fix(cross-domain): don't inject callbackURL when not provided (#276)
- fix(cross-domain): only notify session signal when token value changes (#273)
- fix: skip session refresh/delete in query context for all paths (#272)
- fix(react): handle missing window.location in React Native (#270)
- fix(cross-domain): only rewrite set-cookie for cross-domain requests (#269)
- fix(react): deduplicate concurrent fetchAccessToken calls (#267) @ramonclaudio
- fix: Better Auth schema model lookup (#231) @potrepka

## 0.10.11

- fix: stale credentials and incorrect auth state after session expiry (#218)
  @ramonclaudio
- fix(react): use initialToken on first render for SSR hydration (#223)
  @nilskroe
- fix(adapter): return Date objects from customTransformOutput (#236) @tomsiwik
- fix(react): pass throw: false to internal token fetch (#241) @juliesaia
- fix: prevent request hanging in Bun by selectively forwarding headers (#253)
  @shrutikcs
- fix: add optional chaining to ctx.path (#256) @bitojoe
- fix: widen better-auth peer dependency to >=1.4.9 <1.5.0 (#245) @ramonclaudio

## 0.10.10

- fix(cross-domain): only notify session signal on session cookie set

## 0.10.9

- fix(adapter): hide vitest imports from esbuild

## 0.10.8

- fix(adapter): avoid vitest import errors in bundle

## 0.10.7

- feat: use better-auth/minimal for smaller bundle
- feat: update to better-auth 1.4.9
- chore: drop extra logs, enforce via lint
- fix: use correct host header format in framework route handlers

## 0.10.6

- fix(adapter): (re-)enable array support

## 0.10.5

- fix(plugin): avoid pathless route match errors

## 0.10.4

- fix(build): use outside type imports to avoid dead code in builds

## 0.10.3

- fix(build): enforce type imports, tsc does not tree shake

## 0.10.2

- fix(build): exclude cross-domain server plugin from client bundle

## 0.10.1

- fix: make transient dependencies explicit

## 0.10.0

- feat: support Better Auth 1.4.7
- feat: faster JWT validation for authenticated server calls using customJwt
- feat: default auth configuration provided through utility function
- feat: authenticated server utilities for TanStack Start and Next.js
  (fetchAuthQuery, etc.)
- feat: improved SSR support with patterns to prevent server data dropping
  during client auth
- feat: Next.js works without expectAuth for seamless rendering
- feat: simplified session validation with authComponent.getAuthUser()
- feat: initial token support in ConvexBetterAuthProvider for faster client
  initialization
- feat: explicit Convex URL configuration with runtime checks to reduce
  environment variable issues
- feat: remove optionsOnly complexity in createAuth()
- feat(experimental): static JWKS support to reduce Convex backend token
  validation time
- feat(experimental): JWT caching to speed page loads and navigation for SSR

## 0.9.11

- fix: drop stray troubleshooting logs

## 0.9.10

- fix: support custom schema type in createClient

## 0.9.9

- fix: update import extensions for esm resolution

## 0.9.8

- chore: update to latest component authoring guidelines and tooling

## 0.9.7

- fix: add type error for triggers without authFunctions
- fix: support Better Auth options inference through getStaticAuth
- fix(tanstack): add improved tanstack integration methods

## 0.9.6

- fix: swap oldDoc/newDoc onUpdate in types
- fix(adapter): add json field schema support
- fix(adapter: support custom field names in schema generation
- fix(adapter): support custom table names in schema generation

## 0.9.5

- fix(cross-domain): remove extra logs

## 0.9.4

- fix: move semver dependency to dependencies'

## 0.9.3

- fix: allow authorization header for cors by default

## 0.9.2

- feat(convex-plugin): set token cookie on siwe verify response

## 0.9.1

- fix(convex-plugin): correctly parse cookie for ssa jwt token

## 0.9.0

- feat: add getAuth component method
- chore: support Better Auth 1.3.27
- feat: update helpers, docs, and examples for latest TanStack RC
- docs: add migration guides for dropping user.userId field
- fix: reference session by token from jwt in getHeaders
- docs: add api docs for a few of the more often used methods
- fix: block stale session delete for get-session client calls
- feat: add requireRunMutationCtx and requireActionCtx type utils
- fix: swap old and new doc params in onUpdate trigger

  This was just a mistake in design - you often will not need the old doc in an
  update trigger, so it should be a trailing param

  BREAKING CHANGE: 2nd and 3rd params in onUpdate trigger are swapped

## 0.8.9

- fix(react): fix overreacting fetch token hook

## 0.8.8

- fix: use correct session field for getHeaders query

## 0.8.7

- fix: use jwt session id for getHeaders state
- fix: ensure jwt updates when session changes
- feat: support using cross-domain plugin with expo web

## 0.8.6

- fix(react-start): fix TanStack utility types

## 0.8.5

- fix(react-start): get setupFetchClient getCookie through args
- feat: add authComponent.getAnyUserById method

## 0.8.4

- fix: fix createAuth types in framework helpers
- feat: improve ctx types passed to createAuth

## 0.8.3

- fix: use correct type for getAuthUser ctx

## 0.8.2

- fix: error if generating component schema in app convex directory
- fix: fix esbuild error due to node import in createSchema
- fix: support disabling logging for static auth instances

## 0.8.1

- fix(tanstack): drop getAuth, update docs to implement locally
- fix: always return a headers object from getHeaders
- fix: use correct signature for onUpdate trigger

## 0.8.0

- docs: rewrite docs
- feat: support local install, improve unrelated apis
- fix(adapter): apply all where clauses for compound queries
- fix: support session type inference in client
- fix: log error on invalid table name
- feat: support additionalFields options for user table
- fix: use options basePath for oidc discovery redirect
- feat: add `getUserByUsername` component method
- fix: return application userId for reference fields
- fix: use correct package exports for client plugins

## 0.7.18

- chore: upgrade to Better Auth 1.3.8

## 0.7.17

- fix: disable telemetry by default

## 0.7.16

- chore: upgrade to Better Auth 1.3.7

## 0.7.15

- fix: add missing return types to component methods

## 0.7.14

- fix: update jwks_uri to include options basePath

## 0.7.13

- fix: support auth.api calls without headers

## 0.7.12

- warn on secure cookie mismatch between Convex and Next.js
- maintain dropped fields in Better Auth schema to avoid breaking deploys
- support Better Auth 1.3.4

## 0.7.11

- fix build output type errors, simplify watch task
- fix TanStack helper docs, throw on invalid env vars

## 0.7.10

- fix: support inferring user/session schema changes from plugins
- fix: remove redundant auth check in getCurrentSession

## 0.7.9

- Add context type guards to utils.

## 0.7.8

- Add `updateUserMetadata` method to the client (undocumented, may change or be
  removed).

## 0.7.7

- generate admin plugin schema

## 0.7.5

- fix: roll back trusted origins breaking change for cors

## 0.7.4

- feat: allow `registerRoutes` to be called with a `cors` config object

## 0.7.3

- fix: fail to push on invalid Convex version

## 0.7.2

- fix: add Convex version requirement to docs and package.json.

## 0.7.1

- fix: serialize output date values in the adapter.

## 0.7.0

- Pass all Better Auth adapter tests.

- Convert adapter to fully dynamic queries and mutations.

- Add schema generation for component schema.

- Support multiple `registerRoutes` calls.

- Fix email verification redirect.
- Support `trustedOrigins` as a function.

- Simplify CORS handling and make it optional.

  Adds a new `cors` option to the `registerRoutes` method, currently accepts a
  boolean to enable CORS routes and headers.

  The `path` and `allowedOrigins` options have been removed from the
  `registerRoutes` method, they now defer to Better Auth's `basePath` and
  `trustedOrigins` options, respectively. The `siteUrl` option for the
  crossDomain plugin continues to be automatically added to `trustedOrigins`.

- Support `listSessions` method.

- Set jwt cookie at login for SSA.

  Without this the cookie wasn't set until the first authenticated client load,
  making SSA fail when loading the next route after login.

- Delete expired sessions at login. This will help with sessions piling up in
  the database, but doesn't completely solve it, especially for apps with very
  long lived sessions and lots of users.

## 0.6.2

- Fix email verification callback URL rewriting in the crossDomain plugin.
