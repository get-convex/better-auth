import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { createLocalJWKSet, jwtVerify } from "jose";

const site = "http://127.0.0.1:3211";
const base = `${site}/api/auth`;
// Authorization redirects are inspected, never followed to this synthetic client.
const redirectUri = "https://client.example.com/callback";

// Issue real provider tokens through signup, client registration, consent and PKCE.
// No adapter rows or endpoint responses are mocked.
async function authorize(request: APIRequestContext) {
  const signup = await request.post(`${base}/sign-up/email`, {
    data: {
      name: "OAuth test user",
      email: `${randomUUID()}@example.com`,
      password: "TestPassword123!",
    },
  });
  expect(signup.status()).toBe(200);
  const { user } = await signup.json();
  const registration = await request.post(`${base}/oauth2/create-client`, {
    data: {
      client_name: "E2E client",
      redirect_uris: [redirectUri],
      token_endpoint_auth_method: "client_secret_post",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      scope: "openid profile email offline_access",
    },
  });
  expect(registration.status()).toBe(201);
  const { client_id, client_secret } = await registration.json();
  expect(client_id).toBeTruthy();
  expect(client_secret).toBeTruthy();
  const verifier = randomBytes(32).toString("base64url");
  const state = randomUUID();
  const nonce = randomUUID();
  const authorization = await request.get(`${base}/oauth2/authorize`, {
    params: {
      client_id,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid profile email offline_access",
      state,
      nonce,
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
      prompt: "consent",
    },
    maxRedirects: 0,
  });
  expect(authorization.status()).toBe(302);
  const consentUrl = new URL(authorization.headers().location, site);
  expect(consentUrl.pathname).toBe("/consent");
  const consent = await request.post(`${base}/oauth2/consent`, {
    data: { accept: true, oauth_query: consentUrl.search.slice(1) },
  });
  expect(consent.status()).toBe(200);
  const callback = new URL((await consent.json()).url);
  expect(`${callback.origin}${callback.pathname}`).toBe(redirectUri);
  expect(callback.searchParams.get("state")).toBe(state);
  const code = callback.searchParams.get("code");
  expect(code).toBeTruthy();
  const credentials = { client_id, client_secret };
  const exchange = await request.post(`${base}/oauth2/token`, {
    headers: { cookie: "" },
    form: {
      ...credentials,
      grant_type: "authorization_code",
      code: code!,
      code_verifier: verifier,
      redirect_uri: redirectUri,
    },
  });
  expect(exchange.status()).toBe(200);
  const tokens = await exchange.json();
  expect(tokens.access_token).toBeTruthy();
  expect(tokens.refresh_token).toBeTruthy();
  expect(tokens.id_token).toBeTruthy();
  return { credentials, tokens, user, nonce };
}

test.describe(`${process.env.OAUTH_ROUTE_REGISTRATION} OAuth provider`, () => {
  test.beforeEach(async ({ request }) => {
    const mode = await request.get("/registration-mode");
    expect(mode.status()).toBe(200);
    expect(await mode.json()).toEqual({
      registration: process.env.OAUTH_ROUTE_REGISTRATION,
    });
  });
  test("discovery leads to provider metadata and keys that verify its ID token", async ({
    request,
  }) => {
    const root = await request.get(`${site}/.well-known/openid-configuration`, {
      maxRedirects: 0,
    });
    expect(root.status()).toBe(302);
    expect(root.headers().location).toBe(
      `${base}/.well-known/openid-configuration`
    );
    const discovery = await request.get(root.headers().location);
    expect(discovery.status()).toBe(200);
    const metadata = await discovery.json();
    expect(metadata).toMatchObject({
      issuer: base,
      authorization_endpoint: `${base}/oauth2/authorize`,
      token_endpoint: `${base}/oauth2/token`,
      jwks_uri: `${base}/convex/jwks`,
    });
    const { credentials, tokens, user, nonce } = await authorize(request);
    const keys = await request.get(metadata.jwks_uri);
    expect(keys.status()).toBe(200);
    const jwks = await keys.json();
    expect(jwks.keys.length).toBeGreaterThan(0);
    for (const key of jwks.keys) expect(key).not.toHaveProperty("d");
    const { payload } = await jwtVerify(
      tokens.id_token,
      createLocalJWKSet(jwks),
      {
        issuer: metadata.issuer,
        audience: credentials.client_id,
        algorithms: ["RS256"],
      }
    );
    expect(payload).toMatchObject({ sub: user.id, nonce });
  });

  test("refresh rotates the token and rejects reuse of the old token and its family", async ({
    request,
  }) => {
    const { credentials, tokens, user } = await authorize(request);
    const refresh = (token: string) =>
      request.post(`${base}/oauth2/token`, {
        headers: { cookie: "" },
        form: {
          ...credentials,
          grant_type: "refresh_token",
          refresh_token: token,
        },
      });
    const rotation = await refresh(tokens.refresh_token);
    expect(rotation.status()).toBe(200);
    const rotated = await rotation.json();
    expect(rotated.refresh_token).toBeTruthy();
    expect(rotated.refresh_token).not.toBe(tokens.refresh_token);
    expect(rotated.access_token).toBeTruthy();
    const profile = await request.get(`${base}/oauth2/userinfo`, {
      headers: { cookie: "", authorization: `Bearer ${rotated.access_token}` },
    });
    expect(profile.status()).toBe(200);
    expect(await profile.json()).toMatchObject({ sub: user.id });

    const replay = await refresh(tokens.refresh_token);
    expect(replay.status()).toBe(400);
    expect(await replay.json()).toMatchObject({ error: "invalid_grant" });
    const family = await refresh(rotated.refresh_token);
    expect(family.status()).toBe(400);
    expect(await family.json()).toMatchObject({ error: "invalid_grant" });
  });
});
