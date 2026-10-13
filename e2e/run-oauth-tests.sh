#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVEX_URL="http://127.0.0.1:3210"
ADMIN_KEY="${CONVEX_ADMIN_KEY:?CONVEX_ADMIN_KEY must be set (the backend harness injects it)}"

# The fixture consumes the local build; keep its Better Auth and Convex versions
# in e2e/package.json aligned with the root development dependencies.
# Replace the React app on the disposable backend. The separate oauthProvider
# mount keeps this fixture independent of data written by the browser tests.
pushd "$SCRIPT_DIR" > /dev/null
npx convex env set BETTER_AUTH_SECRET "e2e-provider-secret-key-do-not-use-in-production" --url "$CONVEX_URL" --admin-key "$ADMIN_KEY"
for registration in eager lazy; do
  npx convex env set OAUTH_ROUTE_REGISTRATION "$registration" --url "$CONVEX_URL" --admin-key "$ADMIN_KEY"
  npx convex deploy --url "$CONVEX_URL" --admin-key "$ADMIN_KEY" -y
  OAUTH_ROUTE_REGISTRATION="$registration" npx playwright test --config playwright.oauth.config.ts
done
popd > /dev/null
