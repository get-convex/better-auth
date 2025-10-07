# Changelog

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

  This was just a mistake in design - you often will not need the
  old doc in an update trigger, so it should be a trailing param

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

- Add `updateUserMetadata` method to the client (undocumented, may change or be removed).

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
  crossDomain plugin continues to be automatically added to
  `trustedOrigins`.

- Support `listSessions` method.

- Set jwt cookie at login for SSA.

  Without this the cookie wasn't set until the first authenticated client load,
  making SSA fail when loading the next route after login.

- Delete expired sessions at login. This will help with sessions piling up
  in the database, but doesn't completely solve it, especially for apps with very long
  lived sessions and lots of users.

## 0.6.2

- Fix email verification callback URL rewriting in the crossDomain plugin.
