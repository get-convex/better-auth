# Changelog

## Unreleased

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
