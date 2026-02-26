#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load env vars
set -a
source "$SCRIPT_DIR/.env.test"
set +a

CONVEX_URL="http://127.0.0.1:3210"
ADMIN_KEY="0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd"
EXAMPLE_DIR="$SCRIPT_DIR/../examples/react"

# Run convex commands from the example directory so the CLI finds the convex dependency
pushd "$EXAMPLE_DIR" > /dev/null

echo "Setting environment variables on local backend..."
npx convex env set SITE_URL "$SITE_URL" --url "$CONVEX_URL" --admin-key "$ADMIN_KEY"
npx convex env set IS_TEST "true" --url "$CONVEX_URL" --admin-key "$ADMIN_KEY"
npx convex env set BETTER_AUTH_SECRET "e2e-test-secret-key-do-not-use-in-production" --url "$CONVEX_URL" --admin-key "$ADMIN_KEY"

echo "Deploying functions to local backend..."
npx convex deploy --url "$CONVEX_URL" --admin-key "$ADMIN_KEY" -y

popd > /dev/null

echo "Running Playwright tests..."
npx playwright test --config "$SCRIPT_DIR/playwright.config.ts"
