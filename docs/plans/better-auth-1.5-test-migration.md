# Better Auth 1.5 Adapter Test Migration Plan

Date: 2026-03-07
Owner: Convex Better Auth adapter maintainers

## Objective

Upgrade adapter testing to Better Auth 1.5 while preserving meaningful runtime coverage in Convex.

Success criteria:
- Use 1.5 test framework (`@better-auth/test-utils/adapter`) instead of removed `better-auth/adapters/test`.
- Keep tests running through real Convex runtime (`convex-test` + Convex actions), not mocked adapter paths.
- Maintain a strict, auditable skip policy (no stale/unknown skip keys).

## Current Baseline

- Main branch adapter test file result:
  - `33 passed / 4 skipped / 37 total`
- 1.5 reference implementation branch result:
  - `88 passed / 37 skipped / 125 total`
- Upstream 1.5 catalog snapshot used for planning:
  - `110` unique named tests across suites: `basic`, `auth-flow`, `joins`, `number-id`, `uuid`, `transactions`.

## Root Cause

Better Auth 1.5 suite APIs allow runtime schema/option mutation (`modifyBetterAuthOptions`), while current Convex harness binds schema validators statically at module load.

Impact:
- Some skips are true Convex constraints (offset pagination, transaction semantics, adapter-visible ID generation semantics).
- Many skips are currently harness limitations and should be treated as coverage gaps until profile-based harness support is implemented.

## New Policy Artifacts

Added in this phase:
- `scripts/adapter-policy/upstream-test-catalog.json`
  - Pinned upstream test inventory snapshot.
- `scripts/adapter-policy/convex-skip-policy.json`
  - Structured skip/not-run policy with category reasons.
- `scripts/validate-adapter-test-policy.mjs`
  - Validation gate for stale/unknown skips and malformed policy.

## Milestones

1. Policy and validation guardrails (this phase)
- Add structured skip policy with reason categories.
- Validate skip entries map to known upstream test names.
- Validate disabled/not-run suites map to known upstream suites.

2. Harness migration to 1.5 test framework
- Replace legacy `runAdapterTest` path with `testAdapter` + upstream suite composition.
- Preserve Convex runtime execution model.

3. Profile-based schema harness
- Run tests across multiple Convex profiles (`convexTest()` instances) with profile-specific schema/API bindings.
- Re-enable tests currently blocked only by dynamic schema mutation.

4. Suite parity and CI drift guard
- Add CI check to detect upstream catalog drift.
- Keep unsupported list narrow and explicit.

## Guardrails

- Any skip without a category reason is invalid.
- Any skip key that does not match an upstream known test name is invalid.
- Any disabled/not-run suite that is not upstream-known is invalid.

