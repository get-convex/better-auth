# Convex + Better Auth

<!-- START: Include on https://convex.dev/components -->

Use [Better Auth](https://better-auth.com) with
[Convex](https://www.convex.dev).

**Full documentation and guides:
[labs.convex.dev/better-auth](https://labs.convex.dev/better-auth)**

### Framework Agnostic

**Support for popular frameworks.**

Supports popular frameworks, including React, Vue, Svelte, Astro, Solid,
Next.js, Nuxt, Tanstack Start, Hono, and more.

### Authentication

**Email & Password Authentication.**

Built-in support for email and password authentication, with session and account
management features.

### Social Sign-on

**Support multiple OAuth providers.**

Allow users to sign in with their accounts, including GitHub, Google, Discord,
Twitter, and more.

### OAuth 2.1 / OIDC provider

**Serve OAuth and OIDC from Convex.**

The Convex plugin uses `@better-auth/oauth-provider` to expose OAuth 2.1 and
OIDC endpoints from your Convex HTTP deployment, including Dynamic Client
Registration, `/oauth2/userinfo`, RP-initiated logout, and MCP discovery helper
exports.

This package pins the provider integration to `better-auth@1.6.11` and
`@better-auth/oauth-provider@1.6.11`. Keep those versions aligned when
upgrading. Static JWKS remains supported and recommended for fast Convex
WebSocket identity validation.

### Two Factor

**Multi Factor Authentication.**

Secure your users accounts with two factor authentication with a few lines of
code.

<!-- END: Include on https://convex.dev/components -->
