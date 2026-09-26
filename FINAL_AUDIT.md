# Final Engineering Audit — Auto Spot Hub

## Status

This repository is prepared as a **portfolio/GitHub-ready demo**, not as a live dealership commerce platform.

## Changes made in the final preparation

- Fixed duplicate authentication/profile synchronization so a normal auth-state restore no longer increments login counters.
- Removed client-side generation of login/activity audit records; production audit events must come from trusted server-side code.
- Fixed the test-drive workflow so the success screen appears only after Firestore accepts the booking.
- Added submit/loading protection to the test-drive form.
- Made review verification explicitly false for client-created/demo reviews.
- Removed the random fake-review generator from the customer-facing UI.
- Relabelled reviews as community/demo feedback instead of claiming verified purchases.
- Made the review seed data non-verified demo data.
- Added safer localStorage parsing for reviews.
- Added Firestore rules for protected profile fields and basic order/review/test-drive invariants.
- Added a production security boundary document in `SECURITY.md`.
- Added GitHub Actions CI in `.github/workflows/ci.yml`.
- Added an MIT `LICENSE` with a reminder that third-party media assets can have separate terms.
- Removed stale Gemini metadata and synchronized `firebase-blueprint.json` with the current TypeScript model.
- Removed misleading production/business claims from the About/Footer presentation.
- Relabelled checkout and PDF output as demo/order-summary functionality where appropriate.
- Added `typecheck` as a dedicated quality command.
- Added local asset verification to the repository quality gate.
- Prepared the repository without `node_modules` or generated `dist` output.

## Verification performed in this environment

Passed:

- Inventory verification: 28/28 vehicle records and local assets.
- Brand asset verification: 17 brand cards mapped to available local SVG assets.
- Local vehicle asset verification: 28/28.
- TypeScript compilation: `npm run typecheck`.

The uploaded ZIP contained Windows-specific Rollup optional dependencies. Because this audit environment is Linux, the bundled `node_modules` could not execute Vitest/Vite without the Linux Rollup optional package. `node_modules` is intentionally excluded from the final repository. On a clean supported machine/CI runner, run:

```bash
npm ci
npm run check
```

The lockfile contains platform-specific Rollup optional packages, so `npm ci` should select the package appropriate for the host platform.

## Remaining production work

The following are intentionally documented rather than falsely implemented:

1. Server-side authoritative order creation.
2. Server-side price/tax calculation and inventory validation.
3. Real payment provider integration and server-side payment verification.
4. Firebase Storage for production avatar/media uploads.
5. Trusted review verification after completed purchases.
6. Atomic test-drive slot reservation.
7. Firebase App Check, rate limiting, monitoring, and production audit logging.
8. Expanded unit and end-to-end test coverage.

These are production-hardening tasks, not reasons to discard the portfolio project.
